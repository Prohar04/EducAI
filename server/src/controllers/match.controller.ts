/**
 * match.controller.ts
 *
 * Endpoints:
 *   POST  /match/run               — create MatchRun, fire background job, return immediately
 *   GET   /match/latest            — most recent MatchRun + joined program data
 *   GET   /match/run/:runId/status — lightweight status+progress poll
 */
import { Response } from 'express';
import prisma from '#src/config/database.ts';
import { Prisma, ProgramLevel } from '../generated/client.ts';
import { AuthRequest } from '#src/types/authRequest.type.ts';
import { performIngest, normalizeLevel, CountryInput } from '#services/ingest.service.ts';

const AI_SERVER_URL     = process.env.AI_SERVER_URL     ?? 'http://localhost:8888';
const AI_SERVER_API_KEY = process.env.AI_SERVER_API_KEY ?? '';
const CACHE_TTL_MS      = 24 * 60 * 60 * 1000; // 24 hours

// ── AI-server response types ────────────────────────────────────────────────

interface AiProgramKey {
  country_code:    string;
  university_name: string;
  program_title:   string;
  level:           string;
}

interface AiRankedItem {
  program_key: AiProgramKey;
  score:       number;
  reasons:     string[];
}

interface AiScrapeResponse {
  run_id:     string;
  normalized: { countries: CountryInput[] };
  ranked:     AiRankedItem[];
}

type RankedRow = {
  score: number;
  reasons: string[];
  programId: string | null;
  rawData: Record<string, unknown> | null;
};

// ── POST /match/run ───────────────────────────────────────────────────────── //

export const runMatch = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) {
    res.status(400).json({ message: 'Profile not found. Complete your profile first.' });
    return;
  }

  // Prevent duplicate concurrent jobs
  const existing = await prisma.matchRun.findFirst({
    where: { userId, status: { in: ['pending', 'running'] } },
    orderBy: { createdAt: 'desc' },
  });
  if (existing) {
    res.status(200).json({ runId: existing.id, status: existing.status, message: 'Run already in progress.' });
    return;
  }

  const run = await prisma.matchRun.create({
    data: { userId, status: 'pending', progress: 0 },
  });

  // Respond immediately so the client is not blocked
  res.status(200).json({ runId: run.id, status: 'pending' });

  // Launch background worker after response is sent
  setImmediate(() => {
    void runMatchBackground(run.id, userId, profile);
  });
};

// ── Background worker ────────────────────────────────────────────────────── //

type ProfileShape = NonNullable<Awaited<ReturnType<typeof prisma['userProfile']['findUnique']>>>;

async function runMatchBackground(runId: string, userId: string, profile: ProfileShape) {
  const log = (msg: string) => console.log(`[match:${runId}] ${msg}`);

  const setProgress = (n: number) =>
    prisma.matchRun.update({ where: { id: runId }, data: { progress: n } }).catch(() => {});
  const markError = (err: unknown) =>
    prisma.matchRun.update({
      where: { id: runId },
      data: { status: 'error', error: String(err).slice(0, 500), progress: 0 },
    }).catch(() => {});

  try {
    await prisma.matchRun.update({ where: { id: runId }, data: { status: 'running', progress: 10 } });
    log('started');

    const targetCountries = Array.isArray(profile.targetCountries) ? (profile.targetCountries as string[]) : [];
    const intendedLevel   = profile.intendedLevel ?? profile.level ?? 'MSc';
    const intendedMajor   = profile.intendedMajor ?? profile.majorOrTrack ?? 'Computer Science';

    // ── 24-hour cache check ────────────────────────────────────────────────
    const cacheKey   = `${[...targetCountries].sort().join(',')}:${intendedMajor}:${intendedLevel}`;
    const cacheMeta  = await prisma.dataSourceMeta.findUnique({ where: { cacheKey } });
    const isFresh    = cacheMeta && (Date.now() - cacheMeta.lastScrapedAt.getTime() < CACHE_TTL_MS);

    let ranked: RankedRow[] = [];

    if (isFresh) {
      log('cache hit — ranking from DB');
      await setProgress(50);
      ranked = await rankFromDB(profile, targetCountries, intendedLevel, intendedMajor);
      await setProgress(90);

    } else {
      // ── Call AI scraper ────────────────────────────────────────────────
      log('cache miss — calling AI server');
      await setProgress(20);

      const aiPayload = {
        user_id:           userId,
        run_id:            runId,
        target_countries:  targetCountries,
        intended_level:    intendedLevel,
        intended_major:    intendedMajor,
        budget_max_usd:    profile.budgetMax       ?? 30_000,
        gpa:               profile.gpa             ?? 0,
        english_test_type: profile.englishTestType ?? null,
        english_score:     profile.englishScore    ?? null,
      };

      let aiData: AiScrapeResponse;
      try {
        const aiRes = await fetch(`${AI_SERVER_URL}/api/v1/module1/scrape-match`, {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(AI_SERVER_API_KEY ? { 'X-API-KEY': AI_SERVER_API_KEY } : {}),
          },
          body:   JSON.stringify(aiPayload),
          signal: AbortSignal.timeout(120_000),
        });
        if (!aiRes.ok) {
          const txt = await aiRes.text().catch(() => '');
          throw new Error(`AI server ${aiRes.status}: ${txt.slice(0, 200)}`);
        }
        aiData = (await aiRes.json()) as AiScrapeResponse;
      } catch (err) {
        log(`AI server failed: ${err}`);
        await markError(`AI server unavailable — ${err}`);
        return;
      }

      await setProgress(60);
      log(`AI returned ${aiData.ranked?.length ?? 0} ranked items`);

      // ── Ingest normalised programs into Neon ───────────────────────────
      const normalizedCountries = aiData.normalized?.countries ?? [];
      if (normalizedCountries.length > 0) {
        try {
          const counts = await performIngest(normalizedCountries, runId);
          log(`ingest done: ${JSON.stringify(counts)}`);
        } catch (err) {
          log(`ingest non-fatal: ${err}`);
        }
        await prisma.dataSourceMeta.upsert({
          where:  { cacheKey },
          create: { cacheKey, lastScrapedAt: new Date(), parserVersion: '1' },
          update: { lastScrapedAt: new Date() },
        }).catch(() => {});
      }

      await setProgress(80);

      // ── Resolve programKey → DB programId ────────────────────────────
      ranked = await mapAiRankedToIds(aiData.ranked ?? []);
    }

    await setProgress(95);

    // ── Persist match results ──────────────────────────────────────────
    if (ranked.length > 0) {
      await prisma.matchResult.createMany({
        data: ranked.map(r => ({
          runId,
          programId: r.programId ?? null,
          score:     r.score,
          reasons:   r.reasons   as unknown as Prisma.InputJsonValue,
          rawData:   (r.rawData  ?? null) as unknown as Prisma.InputJsonValue,
        })),
      });
    }

    await prisma.matchRun.update({
      where: { id: runId },
      data:  {
        status:   'done',
        progress: 100,
        error: ranked.length === 0
          ? 'No programmes found for your profile. Try adjusting your preferences.'
          : null,
      },
    });
    log(`done — ${ranked.length} results`);

  } catch (err) {
    console.error(`[match:${runId}] unhandled:`, err);
    await markError(err);
  }
}

// ── Batch-resolve AI ranked list → DB programIds ─────────────────────────── //

async function mapAiRankedToIds(aiRanked: AiRankedItem[]): Promise<RankedRow[]> {
  if (!aiRanked.length) return [];

  const codes = [...new Set(aiRanked.map(r => r.program_key.country_code.toUpperCase()))];
  const countries = await prisma.country.findMany({ where: { code: { in: codes } } });
  const countryMap = new Map(countries.map(c => [c.code, c.id]));

  // Unique (countryId, name) pairs
  const uniKeySeen = new Set<string>();
  const uniConds: { countryId: string; name: string }[] = [];
  for (const r of aiRanked) {
    const cid = countryMap.get(r.program_key.country_code.toUpperCase());
    if (!cid) continue;
    const k = `${cid}:${r.program_key.university_name}`;
    if (!uniKeySeen.has(k)) { uniKeySeen.add(k); uniConds.push({ countryId: cid, name: r.program_key.university_name }); }
  }
  const universities = uniConds.length ? await prisma.university.findMany({ where: { OR: uniConds } }) : [];
  const uniMap = new Map(universities.map(u => [`${u.countryId}:${u.name}`, u.id]));

  // Unique (universityId, title, level) triples
  const progKeySeen = new Set<string>();
  const progConds: { universityId: string; title: string; level: ProgramLevel }[] = [];
  for (const r of aiRanked) {
    const cid   = countryMap.get(r.program_key.country_code.toUpperCase());
    const uniId = cid ? uniMap.get(`${cid}:${r.program_key.university_name}`) : undefined;
    const lvl   = normalizeLevel(r.program_key.level) as ProgramLevel | null;
    if (!uniId || !lvl) continue;
    const k = `${uniId}:${r.program_key.program_title}:${lvl}`;
    if (!progKeySeen.has(k)) { progKeySeen.add(k); progConds.push({ universityId: uniId, title: r.program_key.program_title, level: lvl }); }
  }
  const programs = progConds.length ? await prisma.program.findMany({ where: { OR: progConds } }) : [];
  const progMap = new Map(programs.map(p => [`${p.universityId}:${p.title}:${p.level}`, p.id]));

  return aiRanked.map(r => {
    const cid    = countryMap.get(r.program_key.country_code.toUpperCase());
    const uniId  = cid ? uniMap.get(`${cid}:${r.program_key.university_name}`) : undefined;
    const lvl    = normalizeLevel(r.program_key.level);
    const progId = (uniId && lvl) ? (progMap.get(`${uniId}:${r.program_key.program_title}:${lvl}`) ?? null) : null;
    return { score: r.score, reasons: r.reasons, programId: progId, rawData: progId ? null : { ...r.program_key } };
  });
}

// ── Rank from DB (24h cache-hit path) ────────────────────────────────────── //

async function rankFromDB(
  profile: ProfileShape,
  targetCountries: string[],
  levelRaw: string,
  major: string,
): Promise<Array<{ score: number; reasons: string[]; programId: string; rawData: null }>> {
  const level = normalizeLevel(levelRaw) as ProgramLevel | null;
  if (!level || !targetCountries.length) return [];

  const countries = await prisma.country.findMany({
    where:  { code: { in: targetCountries.map(c => c.toUpperCase()) } },
    select: { id: true },
  });
  if (!countries.length) return [];

  const uniIds = (await prisma.university.findMany({
    where:  { countryId: { in: countries.map(c => c.id) } },
    select: { id: true },
  })).map(u => u.id);
  if (!uniIds.length) return [];

  const terms = major.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  const programs = await prisma.program.findMany({
    where: {
      universityId: { in: uniIds },
      level,
      OR: terms.length
        ? [
            ...terms.map(t => ({ field: { contains: t, mode: 'insensitive' as const } })),
            ...terms.map(t => ({ title: { contains: t, mode: 'insensitive' as const } })),
          ]
        : undefined,
    },
    include: {
      university:   { include: { country: true } },
      requirements: true,
    },
    take:    50,
    orderBy: { createdAt: 'desc' },
  });

  const budgetMax = profile.budgetMax ?? Infinity;
  const userGpa   = profile.gpa ?? 0;

  return programs
    .map(p => {
      let score = 0;
      const reasons: string[] = [];
      score += 25; reasons.push(`Located in ${p.university.country.name}`);
      score += 20; reasons.push(`${level} level match`);
      const fld = p.field.toLowerCase();
      if (terms.some(t => fld.includes(t))) { score += 20; reasons.push(`Field match: ${p.field}`); }
      if (p.tuitionMinUSD !== null && p.tuitionMinUSD <= budgetMax) {
        score += 20;
        reasons.push(`Within budget ($${p.tuitionMinUSD.toLocaleString()}–$${(p.tuitionMaxUSD ?? p.tuitionMinUSD).toLocaleString()}/yr)`);
      }
      const gpaReq = p.requirements.find(r => r.key === 'GPA');
      if (gpaReq && userGpa >= parseFloat(gpaReq.value)) { score += 15; reasons.push(`GPA meets minimum`); }
      return { score: Math.min(100, score), reasons, programId: p.id, rawData: null as null };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

// ── GET /match/latest ────────────────────────────────────────────────────── //

export const getLatestMatch = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  try {
    const run = await prisma.matchRun.findFirst({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        results: {
          orderBy: { score: 'desc' },
          include: {
            program: {
              include: { university: { include: { country: true } } },
            },
          },
        },
      },
    });

    if (!run) { res.status(200).json({ run: null }); return; }

    const results = run.results.map(r => ({
      id:        r.id,
      runId:     r.runId,
      programId: r.programId,
      score:     r.score,
      reasons:   r.reasons,
      createdAt: r.createdAt,
      rawData: r.program
        ? {
            program_title:        r.program.title,
            university_name:      r.program.university.name,
            country:              r.program.university.country.code,
            level:                r.program.level,
            field:                r.program.field,
            tuition_usd_per_year: r.program.tuitionMinUSD,
            application_url:      r.program.sourceUrl,
            description:          r.program.description,
          }
        : (r.rawData as Record<string, unknown> | null),
    }));

    res.status(200).json({
      run: {
        id:        run.id,
        userId:    run.userId,
        status:    run.status,
        progress:  run.progress,
        error:     run.error,
        createdAt: run.createdAt,
        updatedAt: run.updatedAt,
        results,
      },
    });
  } catch {
    res.status(500).json({ message: 'Failed to fetch latest match' });
  }
};

// ── GET /match/run/:runId/status ─────────────────────────────────────────── //

export const getRunStatus = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { runId } = req.params as { runId: string };
  try {
    const run = await prisma.matchRun.findFirst({
      where:  { id: runId, userId },
      select: { id: true, status: true, progress: true, error: true, updatedAt: true },
    });
    if (!run) { res.status(404).json({ message: 'Run not found.' }); return; }
    res.status(200).json(run);
  } catch {
    res.status(500).json({ message: 'Failed to fetch run status' });
  }
};
