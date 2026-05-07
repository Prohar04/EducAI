import path from 'node:path';
import fs from 'node:fs';
import type { Request, Response } from 'express';
import { generateGapFix, computeGapFixComparison } from '#src/services/gapfix.service.ts';
import type { GapFixResult } from '#src/services/gapfix.service.ts';
import { Prisma } from '../generated/client.ts';
import prisma from '#src/config/database.ts';
import logger from '#src/config/logger.ts';

type GapStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

interface ImprovementEntry {
  id: string;
  type: string;
  description: string;
  testType?: string;
  scoreValue?: number;
  addedAt: string;
  appliedToProfile: boolean;
}

interface AuthRequest extends Request {
  userId: string;
  file?: Express.Multer.File;
}

function param(p: string | string[]): string {
  return Array.isArray(p) ? p[0] : p;
}

function buildProfileSnapshot(p: {
  gpa?: number | null;
  gpaScale?: string | null;
  backlogs?: number | null;
  graduationYear?: number | null;
  englishTestType?: string | null;
  englishScore?: number | null;
  gre?: number | null;
  gmat?: number | null;
  workExperienceMonths?: number | null;
  intendedLevel?: string | null;
  intendedMajor?: string | null;
  targetCountries?: unknown;
  targetIntake?: string | null;
  currentStage?: string | null;
  fundingNeed?: boolean | null;
}) {
  return {
    gpa: p.gpa ?? null,
    gpaScale: p.gpaScale ?? null,
    backlogs: p.backlogs ?? null,
    graduationYear: p.graduationYear ?? null,
    englishTestType: p.englishTestType ?? null,
    englishScore: p.englishScore ?? null,
    gre: p.gre ?? null,
    gmat: p.gmat ?? null,
    workExperienceMonths: p.workExperienceMonths ?? null,
    intendedLevel: p.intendedLevel ?? null,
    intendedMajor: p.intendedMajor ?? null,
    targetCountries: p.targetCountries ?? [],
    targetIntake: p.targetIntake ?? null,
    currentStage: p.currentStage ?? null,
    fundingNeed: p.fundingNeed ?? null,
  };
}

async function getSessionWithDetails(sessionId: string, userId: string) {
  const session = await prisma.gapFixSession.findFirst({
    where: { id: sessionId, userId },
    include: { evidences: { orderBy: { uploadedAt: 'asc' } } },
  });
  if (!session) return null;

  let previousResult: GapFixResult | null = null;
  if (session.previousSessionId) {
    const prev = await prisma.gapFixSession.findUnique({ where: { id: session.previousSessionId } });
    if (prev) previousResult = prev.result as unknown as GapFixResult;
  }

  const result = session.result as unknown as GapFixResult;
  const comparison = previousResult ? computeGapFixComparison(previousResult, result) : null;

  return { ...session, previousResult, comparison };
}

async function getLatestSessionWithDetails(userId: string) {
  const session = await prisma.gapFixSession.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { evidences: { orderBy: { uploadedAt: 'asc' } } },
  });
  if (!session) return null;

  let previousResult: GapFixResult | null = null;
  if (session.previousSessionId) {
    const prev = await prisma.gapFixSession.findUnique({ where: { id: session.previousSessionId } });
    if (prev) previousResult = prev.result as unknown as GapFixResult;
  }

  const result = session.result as unknown as GapFixResult;
  const comparison = previousResult ? computeGapFixComparison(previousResult, result) : null;

  return { ...session, previousResult, comparison };
}

// ── handlers ─────────────────────────────────────────────────────────────────

// GET /gap-fix/session — fetch latest session for authenticated user
export async function gapFixGetSessionHandler(req: Request, res: Response): Promise<void> {
  const userId = (req as AuthRequest).userId;
  try {
    const session = await getLatestSessionWithDetails(userId);
    if (!session) {
      res.status(404).json({ error: 'No session found' });
      return;
    }
    res.status(200).json(session);
  } catch (err) {
    logger.error(`[gapfix] getSession failed for userId=${userId}: ${err}`);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
}

// POST /gap-fix/analyze — run analysis and persist a new session
export async function gapFixGenerateHandler(req: Request, res: Response): Promise<void> {
  const userId = (req as AuthRequest).userId;

  try {
    const profileRecord = await prisma.userProfile.findUnique({ where: { userId } });

    // Determine how much profile data we have for UX feedback
    const hasGoalData = !!(profileRecord?.intendedLevel || profileRecord?.intendedMajor || profileRecord?.majorOrTrack || profileRecord?.targetCountries);
    const hasAcademicData = !!(profileRecord?.gpa || profileRecord?.englishTestType);
    const analysisMode: 'full' | 'partial' | 'minimal' = !profileRecord
      ? 'minimal'
      : (hasGoalData && hasAcademicData ? 'full' : 'partial');

    logger.info(`[gapfix] generating recommendations for userId=${userId} mode=${analysisMode}`);

    const result = await generateGapFix({
      gpa: profileRecord?.gpa ?? undefined,
      gpaScale: profileRecord?.gpaScale ?? undefined,
      backlogs: profileRecord?.backlogs ?? undefined,
      graduationYear: profileRecord?.graduationYear ?? undefined,
      englishTestType: profileRecord?.englishTestType ?? undefined,
      englishScore: profileRecord?.englishScore ?? undefined,
      gre: profileRecord?.gre ?? undefined,
      gmat: profileRecord?.gmat ?? undefined,
      workExperienceMonths: profileRecord?.workExperienceMonths ?? undefined,
      intendedLevel: profileRecord?.intendedLevel ?? undefined,
      // Priority: intendedAbroadMajor (study abroad target) → intendedMajor → majorOrTrack
      intendedMajor: (profileRecord as unknown as { intendedAbroadMajor?: string }).intendedAbroadMajor
                    ?? profileRecord?.intendedMajor
                    ?? profileRecord?.majorOrTrack
                    ?? undefined,
      targetCountries: (profileRecord?.targetCountries as string[]) ?? undefined,
      targetIntake: profileRecord?.targetIntake ?? undefined,
      currentStage: profileRecord?.currentStage ?? undefined,
      fundingNeed: profileRecord?.fundingNeed ?? undefined,
    });

    const initialStatuses: Record<string, GapStatus> = {};
    for (const rec of result.recommendations) {
      initialStatuses[rec.id] = 'not_started';
    }

    const profileSnap = profileRecord
      ? { ...buildProfileSnapshot(profileRecord), analysisMode }
      : { analysisMode };

    const session = await prisma.gapFixSession.create({
      data: {
        userId,
        result: result as unknown as Prisma.InputJsonValue,
        gapStatuses: initialStatuses as unknown as Prisma.InputJsonValue,
        improvements: [],
        profileSnapshot: profileSnap as unknown as Prisma.InputJsonValue,
      },
      include: { evidences: true },
    });

    logger.info(`[gapfix] session=${session.id} score=${result.profileScore} mode=${analysisMode} for userId=${userId}`);
    res.status(200).json({ ...session, previousResult: null, comparison: null, analysisMode });
  } catch (err) {
    logger.error(`[gapfix] analyze failed for userId=${userId}: ${err}`);
    res.status(502).json({ error: 'Gap analysis failed. Please try again.' });
  }
}

// PATCH /gap-fix/session/:id/status — update one gap's status
export async function gapFixUpdateGapStatusHandler(req: Request, res: Response): Promise<void> {
  const userId = (req as AuthRequest).userId;
  const sessionId = param(req.params.id);
  const { recId, status } = req.body as { recId: string; status: GapStatus };

  const allowed: GapStatus[] = ['not_started', 'in_progress', 'completed', 'skipped'];
  if (!recId || !allowed.includes(status)) {
    res.status(400).json({ error: 'Invalid recId or status' });
    return;
  }

  try {
    const session = await prisma.gapFixSession.findFirst({ where: { id: sessionId, userId } });
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

    const statuses = { ...((session.gapStatuses as unknown as Record<string, GapStatus>) ?? {}) };
    statuses[recId] = status;

    await prisma.gapFixSession.update({
      where: { id: sessionId },
      data: { gapStatuses: statuses as unknown as Prisma.InputJsonValue },
    });

    res.status(200).json({ ok: true, recId, status });
  } catch (err) {
    logger.error(`[gapfix] updateStatus failed sessionId=${sessionId}: ${err}`);
    res.status(500).json({ error: 'Failed to update status' });
  }
}

// POST /gap-fix/session/:id/improvement — log an improvement, optionally update profile
export async function gapFixAddImprovementHandler(req: Request, res: Response): Promise<void> {
  const userId = (req as AuthRequest).userId;
  const sessionId = param(req.params.id);
  const body = req.body as {
    type: string;
    description: string;
    testType?: string;
    scoreValue?: number;
    applyToProfile?: boolean;
  };

  if (!body.type || !body.description) {
    res.status(400).json({ error: 'type and description are required' });
    return;
  }

  try {
    const session = await prisma.gapFixSession.findFirst({ where: { id: sessionId, userId } });
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

    const entry: ImprovementEntry = {
      id: `imp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: body.type,
      description: body.description,
      testType: body.testType,
      scoreValue: body.scoreValue,
      addedAt: new Date().toISOString(),
      appliedToProfile: false,
    };

    // Optionally update UserProfile for test scores
    if (body.applyToProfile && body.testType && body.scoreValue !== undefined) {
      const testType = body.testType.toUpperCase();
      const profilePatch: Record<string, unknown> = {};

      if (['IELTS', 'TOEFL', 'PTE', 'DUOLINGO'].includes(testType)) {
        profilePatch.englishTestType = body.testType;
        profilePatch.englishScore = body.scoreValue;
      } else if (testType === 'GRE') {
        profilePatch.gre = body.scoreValue;
      } else if (testType === 'GMAT') {
        profilePatch.gmat = body.scoreValue;
      }

      if (Object.keys(profilePatch).length > 0) {
        await prisma.userProfile.updateMany({ where: { userId }, data: profilePatch });
        entry.appliedToProfile = true;
      }
    }

    const existing = (session.improvements as unknown as ImprovementEntry[]) ?? [];
    const improvements = [...existing, entry];

    await prisma.gapFixSession.update({
      where: { id: sessionId },
      data: { improvements: improvements as unknown as Prisma.InputJsonValue },
    });

    const full = await getSessionWithDetails(sessionId, userId);
    res.status(200).json(full);
  } catch (err) {
    logger.error(`[gapfix] addImprovement failed sessionId=${sessionId}: ${err}`);
    res.status(500).json({ error: 'Failed to add improvement' });
  }
}

// POST /gap-fix/session/:id/evidence — attach a link or uploaded file
export async function gapFixAddEvidenceHandler(req: Request, res: Response): Promise<void> {
  const userId = (req as AuthRequest).userId;
  const sessionId = param(req.params.id);
  const body = req.body as { recId: string; type: string; label: string; url?: string };
  const uploadedFile = (req as AuthRequest).file;

  if (!body.recId || !body.type || !body.label) {
    res.status(400).json({ error: 'recId, type, and label are required' });
    return;
  }

  try {
    const session = await prisma.gapFixSession.findFirst({ where: { id: sessionId, userId } });
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

    const isLink = !uploadedFile && !!body.url;
    const evidence = await prisma.gapFixEvidence.create({
      data: {
        sessionId,
        userId,
        recId: body.recId,
        type: body.type,
        label: body.label,
        url: isLink ? (body.url ?? undefined) : undefined,
        fileName: uploadedFile?.originalname ?? undefined,
        fileSize: uploadedFile?.size ?? undefined,
        status: uploadedFile ? 'uploaded' : 'linked',
      },
    });

    res.status(201).json(evidence);
  } catch (err) {
    logger.error(`[gapfix] addEvidence failed sessionId=${sessionId}: ${err}`);
    res.status(500).json({ error: 'Failed to add evidence' });
  }
}

// DELETE /gap-fix/evidence/:evidenceId — remove an evidence entry and its file
export async function gapFixDeleteEvidenceHandler(req: Request, res: Response): Promise<void> {
  const userId = (req as AuthRequest).userId;
  const evidenceId = param(req.params.evidenceId);

  try {
    const ev = await prisma.gapFixEvidence.findFirst({ where: { id: evidenceId, userId } });
    if (!ev) { res.status(404).json({ error: 'Evidence not found' }); return; }

    if (ev.fileName && !ev.url) {
      const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'gap-fix');
      const files = fs.existsSync(UPLOAD_DIR) ? fs.readdirSync(UPLOAD_DIR) : [];
      const match = files.find(f => f.endsWith(`-${ev.fileName}`));
      if (match) fs.unlinkSync(path.join(UPLOAD_DIR, match));
    }

    await prisma.gapFixEvidence.delete({ where: { id: evidenceId } });
    res.status(200).json({ ok: true });
  } catch (err) {
    logger.error(`[gapfix] deleteEvidence failed evidenceId=${evidenceId}: ${err}`);
    res.status(500).json({ error: 'Failed to delete evidence' });
  }
}

// POST /gap-fix/session/:id/reanalyze — re-run analysis with current profile, compare to old
export async function gapFixReanalyzeHandler(req: Request, res: Response): Promise<void> {
  const userId = (req as AuthRequest).userId;
  const previousSessionId = param(req.params.id);

  try {
    const previousSession = await prisma.gapFixSession.findFirst({ where: { id: previousSessionId, userId } });
    if (!previousSession) { res.status(404).json({ error: 'Previous session not found' }); return; }

    const profileRecord = await prisma.userProfile.findUnique({ where: { userId } });
    if (!profileRecord) { res.status(404).json({ error: 'Profile not found' }); return; }

    logger.info(`[gapfix] re-analyzing userId=${userId} previousSession=${previousSessionId}`);

    const newResult = await generateGapFix({
      gpa: profileRecord.gpa ?? undefined,
      gpaScale: profileRecord.gpaScale ?? undefined,
      backlogs: profileRecord.backlogs ?? undefined,
      graduationYear: profileRecord.graduationYear ?? undefined,
      englishTestType: profileRecord.englishTestType ?? undefined,
      englishScore: profileRecord.englishScore ?? undefined,
      gre: profileRecord.gre ?? undefined,
      gmat: profileRecord.gmat ?? undefined,
      workExperienceMonths: profileRecord.workExperienceMonths ?? undefined,
      intendedLevel: profileRecord.intendedLevel ?? undefined,
      // Priority: intendedAbroadMajor (study abroad target) → intendedMajor → majorOrTrack
      intendedMajor: (profileRecord as unknown as { intendedAbroadMajor?: string }).intendedAbroadMajor
                    ?? profileRecord.intendedMajor
                    ?? profileRecord.majorOrTrack
                    ?? undefined,
      targetCountries: (profileRecord.targetCountries as string[]) ?? undefined,
      targetIntake: profileRecord.targetIntake ?? undefined,
      currentStage: profileRecord.currentStage ?? undefined,
      fundingNeed: profileRecord.fundingNeed ?? undefined,
    });

    // Carry over statuses for matching recommendation IDs
    const prevStatuses = (previousSession.gapStatuses as unknown as Record<string, GapStatus>) ?? {};
    const newStatuses: Record<string, GapStatus> = {};
    for (const rec of newResult.recommendations) {
      newStatuses[rec.id] = prevStatuses[rec.id] ?? 'not_started';
    }

    const newSession = await prisma.gapFixSession.create({
      data: {
        userId,
        result: newResult as unknown as Prisma.InputJsonValue,
        gapStatuses: newStatuses as unknown as Prisma.InputJsonValue,
        improvements: [],
        profileSnapshot: buildProfileSnapshot(profileRecord) as unknown as Prisma.InputJsonValue,
        previousSessionId,
      },
      include: { evidences: true },
    });

    const previousResult = previousSession.result as unknown as GapFixResult;
    const comparison = computeGapFixComparison(previousResult, newResult);

    logger.info(`[gapfix] re-analysis session=${newSession.id} score ${previousResult.profileScore} → ${newResult.profileScore}`);
    res.status(200).json({ ...newSession, previousResult, comparison });
  } catch (err) {
    logger.error(`[gapfix] reanalyze failed userId=${userId}: ${err}`);
    res.status(502).json({ error: 'Re-analysis failed. Please try again.' });
  }
}
