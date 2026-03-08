/**
 * strategy.controller.ts
 *
 * Endpoints:
 *   POST /strategy/generate            — call ai-server, cache & persist StrategyReport
 *   GET  /strategy/latest?countryCode= — latest StrategyReport for a country
 */
import { createHash } from 'crypto';
import { Response } from 'express';
import { AuthRequest } from '#src/types/authRequest.type.ts';
import prisma from '#src/config/database.ts';
import { Prisma } from '../generated/client.ts';

const AI_SERVER_URL     = process.env.AI_SERVER_URL     ?? 'http://localhost:8888';
const AI_SERVER_API_KEY = process.env.AI_SERVER_API_KEY ?? '';

// ── Cache key ────────────────────────────────────────────────────────────────

function buildCacheKey(
  userId: string,
  countryCode: string,
  intake: string,
  profileUpdatedAt: Date,
  savedProgramsHash: string,
): string {
  const raw = `${userId}:${countryCode}:${intake}:${profileUpdatedAt.toISOString()}:${savedProgramsHash}`;
  return createHash('sha256').update(raw).digest('hex');
}

function hashProgramIds(ids: string[]): string {
  return createHash('md5').update([...ids].sort().join(',')).digest('hex');
}

// ── POST /strategy/generate ───────────────────────────────────────────────── //

export const generateStrategy = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { countryCode, intake, focusProgramIds } = req.body as {
    countryCode?: string;
    intake?: string;
    focusProgramIds?: string[];
  };

  if (!countryCode) {
    res.status(400).json({ message: 'countryCode is required' });
    return;
  }

  try {
    const [profile, savedPrograms] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.savedProgram.findMany({
        where: { userId },
        include: {
          program: {
            include: {
              university: { include: { country: true } },
              requirements: true,
              deadlines: true,
            },
          },
        },
      }),
    ]);

    if (!profile) {
      res.status(400).json({ message: 'Profile not found. Complete your profile first.' });
      return;
    }

    const intakeStr = intake ?? profile.targetIntake ?? '';
    const countryPrograms = savedPrograms.filter(
      (sp) => sp.program.university.country.code === countryCode,
    );
    const focusList = focusProgramIds?.length
      ? countryPrograms.filter((sp) => focusProgramIds.includes(sp.program.id))
      : countryPrograms;

    const programIds = focusList.map((sp) => sp.program.id);
    const cacheKey = buildCacheKey(
      userId,
      countryCode,
      intakeStr,
      profile.updatedAt,
      hashProgramIds(programIds),
    );

    // Return cached report if nothing changed
    const cached = await prisma.strategyReport.findFirst({
      where: { userId, cacheKey },
      orderBy: { createdAt: 'desc' },
    });
    if (cached) {
      res.json({ ...cached, cached: true });
      return;
    }

    // Build payload for ai-server
    const programsPayload = focusList.map((sp) => ({
      title: sp.program.title,
      university: sp.program.university.name,
      field: sp.program.field,
      level: sp.program.level,
      tuitionMinUSD: sp.program.tuitionMinUSD,
      tuitionMaxUSD: sp.program.tuitionMaxUSD,
      deadlines: sp.program.deadlines.map((d) => ({
        term: d.term,
        deadline: d.deadline.toISOString(),
      })),
      requirements: sp.program.requirements.map((r) => ({ key: r.key, value: r.value })),
    }));

    const aiPayload = {
      profile: {
        currentStage: profile.currentStage,
        intendedLevel: profile.intendedLevel,
        majorOrTrack: profile.majorOrTrack,
        intendedMajor: profile.intendedMajor,
        gpa: profile.gpa,
        gpaScale: profile.gpaScale,
        englishTestType: profile.englishTestType,
        englishScore: profile.englishScore,
        gre: profile.gre,
        gmat: profile.gmat,
        budgetCurrency: profile.budgetCurrency,
        budgetMax: profile.budgetMax,
        fundingNeed: profile.fundingNeed,
        targetIntake: profile.targetIntake,
        workExperienceMonths: profile.workExperienceMonths,
      },
      countryCode,
      intake: intakeStr,
      programs: programsPayload,
      savedCount: savedPrograms.length,
    };

    // Call ai-server
    const aiRes = await fetch(`${AI_SERVER_URL}/api/v1/module1/strategy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AI_SERVER_API_KEY,
      },
      body: JSON.stringify(aiPayload),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text().catch(() => 'unknown error');
      console.error('[strategy/generate] ai-server error:', aiRes.status, errText);
      res.status(502).json({ message: 'AI server error. Please try again.' });
      return;
    }

    const report = await aiRes.json() as Record<string, unknown>;

    const saved = await prisma.strategyReport.create({
      data: {
        userId,
        countryCode,
        intake: intakeStr || null,
        programIds,
        cacheKey,
        report: report as unknown as Prisma.InputJsonValue,
      },
    });

    res.json({ ...saved, cached: false });
  } catch (err) {
    console.error('[strategy/generate]', err);
    res.status(500).json({ message: 'Failed to generate strategy' });
  }
};

// ── GET /strategy/latest ─────────────────────────────────────────────────── //

export const getLatestStrategy = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const countryCode = req.query.countryCode as string | undefined;

  try {
    const where = countryCode ? { userId, countryCode } : { userId };
    const report = await prisma.strategyReport.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (!report) {
      res.status(404).json({ message: 'No strategy report found. Generate one first.' });
      return;
    }

    res.json(report);
  } catch (err) {
    console.error('[strategy/latest]', err);
    res.status(500).json({ message: 'Failed to fetch strategy report' });
  }
};
