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
import { toUSD } from '#src/utils/exchangeRates.ts';
import logger from '#src/config/logger.ts';

const AI_SERVER_URL     = process.env.AI_SERVER_URL     ?? 'http://localhost:8001';
const AI_SERVER_API_KEY = process.env.AI_SERVER_API_KEY ?? '';
const CACHE_TTL_MS      = 24 * 60 * 60 * 1000; // 24 hours
// The scraper is only reached when the database holds nothing for this search,
// and it now runs inside the request. The whole handler must fit the function's
// 45s budget, so a single attempt with a hard ceiling well inside it.
const AI_TIMEOUT_MS     = 20_000;
const AI_MAX_RETRIES    = 1;

/**
 * A live run is user-initiated and the user is watching a progress bar, so it
 * gets most of the function's 45s budget in one attempt rather than the short
 * ceiling used when the scraper is only a fallback.
 */
const AI_LIVE_TIMEOUT_MS = 34_000;

/** A run older than this that is still 'running' is treated as dead. */
const STALE_RUN_MS      = 3 * 60 * 1000;
const AI_RETRY_BASE_MS  = 1_000;

// ── Major synonym map (mirrors Python taxonomy for DB cache-hit ranking) ── //

const MAJOR_SYNONYMS: Record<string, string[]> = {
  'computer science':       ['cs', 'computing', 'software engineering', 'information technology', 'it'],
  'artificial intelligence':['ai', 'machine learning', 'ml', 'deep learning', 'neural networks', 'data science'],
  'cybersecurity':          ['information security', 'network security', 'cyber security', 'digital forensics', 'infosec'],
  'data science':           ['data analytics', 'big data', 'machine learning', 'ml', 'statistics', 'business analytics'],
  'software engineering':   ['cs', 'computer science', 'software development', 'information technology'],
  'electrical engineering': ['ee', 'electronics', 'power systems', 'telecommunications'],
  'mechanical engineering': ['me', 'manufacturing', 'aerospace engineering', 'thermal engineering'],
  'civil engineering':      ['structural engineering', 'environmental engineering', 'geotechnical'],
  'chemical engineering':   ['process engineering', 'materials engineering'],
  'biomedical engineering': ['bioengineering', 'medical engineering', 'biomed', 'biotechnology'],
  'engineering':            ['mechanical', 'electrical', 'civil', 'chemical', 'engineering management'],
  'business administration':['mba', 'business management', 'management', 'business studies'],
  'finance':                ['financial management', 'fintech', 'banking', 'investment management'],
  'accounting':             ['auditing', 'tax', 'financial accounting', 'management accounting'],
  'economics':              ['econometrics', 'financial economics', 'applied economics'],
  'marketing':              ['digital marketing', 'brand management', 'advertising'],
  'law':                    ['legal studies', 'jurisprudence', 'llm', 'llb', 'international law'],
  'public health':          ['epidemiology', 'global health', 'health policy', 'mph', 'community health'],
  'medicine':               ['mbbs', 'medical science', 'clinical medicine', 'healthcare'],
  'nursing':                ['healthcare', 'clinical nursing', 'nurse practitioner'],
  'pharmacy':               ['pharmaceutical sciences', 'pharmacology', 'clinical pharmacy'],
  'psychology':             ['cognitive science', 'behavioral science', 'clinical psychology', 'counseling'],
  'political science':      ['international relations', 'governance', 'public policy', 'public administration'],
  'international relations':['diplomacy', 'foreign policy', 'global studies', 'political science'],
  'environmental science':  ['environmental studies', 'sustainability', 'ecology', 'climate science'],
  'architecture':           ['urban planning', 'interior design', 'urban design'],
  'design':                 ['graphic design', 'ux design', 'product design', 'user experience'],
  'media':                  ['media studies', 'journalism', 'communications', 'mass communication'],
  'biotechnology':          ['bioinformatics', 'molecular biology', 'genetic engineering', 'life sciences'],
  'mathematics':            ['applied mathematics', 'statistics', 'actuarial science', 'math'],
};

/** Expand a major name into a set of lowercase search terms (min 2 chars). */
function getMajorTerms(major: string): string[] {
  const lower = major.toLowerCase().trim();
  const termSet = new Set<string>();

  // Direct canonical key
  if (MAJOR_SYNONYMS[lower]) {
    termSet.add(lower);
    for (const s of MAJOR_SYNONYMS[lower]) termSet.add(s);
  } else {
    // Synonym lookup
    let found = false;
    for (const [canonical, synonyms] of Object.entries(MAJOR_SYNONYMS)) {
      if (synonyms.includes(lower)) {
        termSet.add(canonical);
        for (const s of synonyms) termSet.add(s);
        found = true;
        break;
      }
    }
    if (!found) {
      // Partial word overlap fallback
      const queryWords = lower.split(/\s+/).filter(w => w.length > 2);
      for (const [canonical, synonyms] of Object.entries(MAJOR_SYNONYMS)) {
        const canonWords = canonical.split(/\s+/);
        if (queryWords.some(w => canonWords.includes(w))) {
          termSet.add(canonical);
          for (const s of synonyms) termSet.add(s);
        }
      }
      // Always include the raw major words too
      termSet.add(lower);
    }
  }

  // Flatten all terms into individual words, min 2 chars (allows "AI", "CS", "ML")
  const words = new Set<string>();
  for (const term of termSet) {
    for (const w of term.split(/\s+/)) {
      if (w.length > 1) words.add(w);
    }
  }
  return [...words];
}

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

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAiWithRetry(
  url: string,
  init: RequestInit,
  log: (msg: string) => void,
  timeoutMs: number = AI_TIMEOUT_MS,
) {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= AI_MAX_RETRIES; attempt += 1) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
      if (res.ok) return res;

      // Retry on transient server errors
      if (res.status >= 500 && res.status < 600) {
        const body = await res.text().catch(() => '');
        lastErr = new Error(`AI server ${res.status}: ${body.slice(0, 200)}`);
      } else {
        return res;
      }
    } catch (err) {
      lastErr = err;
    }

    if (attempt < AI_MAX_RETRIES) {
      const backoff = AI_RETRY_BASE_MS * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * 250);
      log(`AI server retry ${attempt}/${AI_MAX_RETRIES} in ${backoff + jitter}ms`);
      await sleep(backoff + jitter);
    }
  }

  throw lastErr;
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
  // `live` asks for a fresh crawl rather than an answer from stored data.
  const live = (req.body as { live?: boolean } | undefined)?.live === true;

  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) {
    res.status(400).json({ message: 'Profile not found. Complete your profile first.' });
    return;
  }

  // Close out runs that can never finish. Before the work moved inline, a run
  // interrupted mid-flight stayed 'running' forever — and because the guard
  // below refuses to start a second run while one is active, a single dead run
  // permanently locked the user out of matching.
  await prisma.matchRun.updateMany({
    where: {
      userId,
      status:    { in: ['pending', 'running'] },
      createdAt: { lt: new Date(Date.now() - STALE_RUN_MS) },
    },
    data: {
      status: 'error',
      error:  'This run did not finish. Please try again.',
    },
  });

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

  // Run to completion before responding.
  //
  // This used to respond first and finish the work in a setImmediate callback.
  // On a long-lived server that is fine; on a serverless platform the function
  // is frozen the moment the response is flushed, so the callback was killed
  // partway through and the run sat at 'running' forever — the client polled
  // indefinitely and, because getLatestMatch returns the newest run whatever
  // its status, the user's previous good results were hidden behind it.
  //
  // Ranking is a single query now, so the common path finishes in well under
  // the function's budget. The client contract is unchanged: it still receives
  // a runId and polls, it just finds the run already finished.
  await runMatchBackground(run.id, userId, profile, live);

  const finished = await prisma.matchRun.findUnique({
    where:  { id: run.id },
    select: { status: true, progress: true, error: true },
  });

  res.status(200).json({
    runId:    run.id,
    status:   finished?.status   ?? 'done',
    progress: finished?.progress ?? 100,
    error:    finished?.error    ?? null,
  });
};

// ── Background worker ────────────────────────────────────────────────────── //

type ProfileShape = NonNullable<Awaited<ReturnType<typeof prisma['userProfile']['findUnique']>>>;

async function runMatchBackground(
  runId: string,
  userId: string,
  profile: ProfileShape,
  /** Scrape the web now instead of answering from stored programmes. */
  live = false,
) {
  const log = (msg: string) => logger.info(`[match:${runId}] ${msg}`);

  const setProgress = (n: number) =>
    prisma.matchRun.update({ where: { id: runId }, data: { progress: n } }).catch(() => {});
  const markError = (err: unknown) => {
    logger.error(`[match:${runId}] background error:`, err);
    return prisma.matchRun.update({
      where: { id: runId },
      data: { status: 'error', error: 'Matching failed. Please try again.', progress: 0 },
    }).catch(() => {});
  };

  try {
    await prisma.matchRun.update({ where: { id: runId }, data: { status: 'running', progress: 10 } });
    log('started');

    const targetCountries = Array.isArray(profile.targetCountries) ? (profile.targetCountries as string[]) : [];
    const intendedLevel   = profile.intendedLevel ?? profile.level ?? 'MSc';
    // Prefer intendedAbroadMajor (what user wants to study abroad) over current major
    const intendedMajor   = (profile as unknown as { intendedAbroadMajor?: string }).intendedAbroadMajor
                            ?? profile.intendedMajor
                            ?? profile.majorOrTrack
                            ?? 'Computer Science';

    // ── 24-hour cache check ────────────────────────────────────────────────
    const cacheKey   = `${[...targetCountries].sort().join(',')}:${intendedMajor}:${intendedLevel}`;
    const cacheMeta  = await prisma.dataSourceMeta.findUnique({ where: { cacheKey } });
    // An explicit live run ignores the cache: the whole point is to go and
    // fetch programmes that are not in the database yet.
    const isFresh    = !live && cacheMeta
                       && (Date.now() - cacheMeta.lastScrapedAt.getTime() < CACHE_TTL_MS);

    // Rank from what we already hold, always and first. Scraping is what made
    // this slow: on a cache miss the user waited out a live crawl before seeing
    // anything, even though the database usually had a perfectly good answer.
    // Now the stored data answers immediately and the crawl, when needed, runs
    // behind the delivered result to improve the *next* run.
    await setProgress(40);
    let ranked: RankedRow[] = await rankFromDB(
      profile, targetCountries, intendedLevel, intendedMajor,
    );
    await setProgress(70);

    const canServeFromDB = ranked.length > 0;
    if (canServeFromDB) {
      log(`ranked ${ranked.length} from DB${isFresh ? ' (cache fresh)' : ' (cache stale — refreshing behind this result)'}`);
    }

    // Normally the scraper is only worth waiting for when the database has
    // nothing — stored programmes answer instantly and a crawl would just make
    // the user wait. A live run is the deliberate exception: the user asked for
    // fresh data and has accepted the wait.
    if (live || (!isFresh && !canServeFromDB)) {
      // ── Call AI scraper ────────────────────────────────────────────────
      log('cache miss — calling AI server');
      await setProgress(20);

      const aiPayload = {
        user_id:           userId,
        run_id:            runId,
        target_countries:  targetCountries,
        intended_level:    intendedLevel,
        intended_major:    intendedMajor,
        // Use pre-normalized USD value; fall back to on-the-fly conversion; then default.
        budget_max_usd:    profile.budgetAmountUSD
                           ?? (profile.budgetMax != null
                               ? (toUSD(profile.budgetMax, profile.budgetCurrency ?? 'USD') ?? 30_000)
                               : 30_000),
        gpa:               profile.gpa             ?? 0,
        english_test_type: profile.englishTestType ?? null,
        english_score:     profile.englishScore    ?? null,
      };

      let aiData: AiScrapeResponse | null = null;
      try {
        const aiRes = await fetchAiWithRetry(`${AI_SERVER_URL}/api/v1/module1/scrape-match`, {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(AI_SERVER_API_KEY ? { 'X-API-KEY': AI_SERVER_API_KEY } : {}),
          },
          body:   JSON.stringify(aiPayload),
        }, log, live ? AI_LIVE_TIMEOUT_MS : AI_TIMEOUT_MS);
        if (!aiRes.ok) {
          const txt = await aiRes.text().catch(() => '');
          throw new Error(`AI server ${aiRes.status}: ${txt.slice(0, 200)}`);
        }
        aiData = (await aiRes.json()) as AiScrapeResponse;
      } catch (err) {
        log(`AI server failed: ${err}`);
        aiData = null;
      }

      if (aiData) {
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
        const scraped = await mapAiRankedToIds(aiData.ranked ?? []);

        // Merge rather than replace. A crawl only covers the handful of pages
        // it had time to read, so it typically returns a few programmes while
        // the database holds many — swapping one for the other would answer
        // "give me fresher results" by deleting most of them. Freshly scraped
        // entries lead, the stored ranking fills in behind, and anything the
        // scrape re-verified is deduplicated by programme id.
        if (scraped.length > 0) {
          const seen = new Set(scraped.map(r => r.programId).filter(Boolean));
          const merged = [
            ...scraped,
            ...ranked.filter(r => !r.programId || !seen.has(r.programId)),
          ];
          log(`scrape produced ${scraped.length}; merged with ${ranked.length} stored -> ${merged.length}`);
          ranked = merged.slice(0, 20);
        } else if (ranked.length > 0) {
          log('scrape returned nothing usable — keeping the stored ranking');
        }
      } else {
        log(
          ranked.length > 0
            ? 'scraper unavailable — keeping the stored ranking'
            : 'scraper unavailable and no stored programmes matched — returning empty',
        );
        await setProgress(80);
      }
    } else if (!isFresh) {
      // The corpus is stale but the database still answered, so the user has
      // results. Refreshing it here would mean either making them wait for a
      // crawl or deferring it — and deferred work does not survive the function
      // freeze. The scheduled Data Sync Agent workflow refreshes the corpus
      // twice daily, which is the right place for it.
      log('corpus stale — leaving the refresh to the scheduled sync');
    }

    await setProgress(95);

    // ── Persist match results (atomic: results + status update together) ──
    await prisma.$transaction(async (tx) => {
      if (ranked.length > 0) {
        await tx.matchResult.createMany({
          data: ranked.map(r => ({
            runId,
            programId: r.programId ?? null,
            score:     r.score,
            reasons:   r.reasons   as unknown as Prisma.InputJsonValue,
            rawData:   (r.rawData  ?? null) as unknown as Prisma.InputJsonValue,
          })),
        });
      }
      await tx.matchRun.update({
        where: { id: runId },
        data:  {
          status:   'done',
          progress: 100,
          error: ranked.length === 0
            ? 'No programmes found for your profile. Try adjusting your preferences.'
            : null,
        },
      });
    });
    log(`done — ${ranked.length} results`);

  } catch (err) {
    logger.error(`[match:${runId}] unhandled:`, { err });
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
  if (!level) return [];

  const terms = getMajorTerms(major);

  // Previously this made three sequential round trips — countries, then every
  // university in them, then programs filtered by an `IN` list of hundreds of
  // university ids. The country filter is expressed as a nested relation
  // instead, so the database does the join once and the large `IN` list never
  // crosses the wire. On a Vercel function talking to a remote Postgres, two
  // saved round trips matter more than the query cost itself.
  const programs = await prisma.program.findMany({
    where: {
      ...(targetCountries.length
        ? { university: { country: { code: { in: targetCountries.map(c => c.toUpperCase()) } } } }
        : {}),
      level,
      // Never rank an intake the user can no longer apply to. Programs with no
      // recorded deadline are kept — missing data is not a closed deadline.
      AND: [
        {
          OR: [
            { deadlines: { some: { deadline: { gte: new Date() } } } },
            { deadlines: { none: {} } },
          ],
        },
      ],
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

  // Use the pre-normalized USD value for fair comparison against tuitionMinUSD (always USD).
  // Fall back to on-the-fly conversion if budgetAmountUSD wasn't persisted yet.
  const budgetMax = profile.budgetAmountUSD
    ?? (profile.budgetMax != null
        ? (toUSD(profile.budgetMax, profile.budgetCurrency ?? 'USD') ?? Infinity)
        : Infinity);
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

// Shared by both lookups in getLatestMatch.
const MATCH_RESULT_INCLUDE = {
  results: {
    orderBy: { score: 'desc' },
    include: {
      program: {
        include: {
          university:   { include: { country: true } },
          deadlines:    { orderBy: { deadline: 'asc' } },
          requirements: true,
        },
      },
    },
  },
} satisfies Prisma.MatchRunInclude;

// ── GET /match/latest ────────────────────────────────────────────────────── //

export const getLatestMatch = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  try {
    // Prefer the newest run that actually produced results. A failed or
    // interrupted run used to win on createdAt alone and render an empty state,
    // which made a user's existing matches look deleted when they were still
    // sitting in the database behind it.
    const run =
      (await prisma.matchRun.findFirst({
        where:   { userId, status: 'done', results: { some: {} } },
        orderBy: { createdAt: 'desc' },
        include: MATCH_RESULT_INCLUDE,
      })) ??
      (await prisma.matchRun.findFirst({
        where:   { userId },
        orderBy: { createdAt: 'desc' },
        include: MATCH_RESULT_INCLUDE,
      }));



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
            program_title:           r.program.title,
            university_name:         r.program.university.name,
            country:                 r.program.university.country.name,
            country_code:            r.program.university.country.code,
            city:                    r.program.university.city ?? null,
            university_website:      r.program.university.website ?? null,
            university_description:  r.program.university.description ?? null,
            level:                   r.program.level,
            field:                   r.program.field,
            duration_months:         r.program.durationMonths ?? null,
            tuition_usd_per_year:    r.program.tuitionMinUSD ?? null,
            tuition_max_usd:         r.program.tuitionMaxUSD ?? null,
            application_url:         r.program.sourceUrl ?? null,
            description:             r.program.description ?? null,
            next_deadline:           r.program.deadlines[0]?.deadline ?? null,
            next_deadline_term:      r.program.deadlines[0]?.term ?? null,
            updated_at:              r.program.updatedAt,

            // Everything below already existed on the records and was simply
            // not being returned, forcing users onto the university's own site
            // for basics like ranking, entry requirements or the fee.
            university_ranking:      r.program.university.ranking ?? null,
            university_type:         r.program.university.universityType ?? null,
            admissions_url:          r.program.university.admissionsUrl ?? null,
            tuition_url:             r.program.university.tuitionUrl ?? null,
            scholarships_url:        r.program.university.scholarshipsUrl ?? null,
            international_url:       r.program.university.internationalUrl ?? null,
            apply_url:               r.program.applicationPortalUrl
                                     ?? r.program.university.applicationPortalUrl
                                     ?? null,
            application_fee_usd:     r.program.applicationFeeUSD ?? null,
            study_mode:              r.program.studyMode ?? null,
            language_of_instruction: r.program.languageOfInstruction ?? null,
            last_verified_at:        r.program.lastVerifiedAt ?? null,
            requirements:            r.program.requirements.map(q => ({
                                       key:   q.key,
                                       value: q.value,
                                     })),
            deadlines:               r.program.deadlines.map(d => ({
                                       term:     d.term,
                                       deadline: d.deadline,
                                     })),
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
