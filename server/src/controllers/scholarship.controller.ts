import type { Request, Response } from 'express';
import { z } from 'zod';
import logger from '#src/config/logger.ts';
import {
  searchScholarships,
  getScholarshipById,
  getUpcomingDeadlines,
  checkEligibility,
  predictFundingProbability,
  getEligibleScholarships,
  computeMatchScore,
} from '#src/services/scholarship.service.ts';
import { runLiveScholarshipRefresh } from '#src/services/liveScholarship.service.ts';
import { searchFallbackScholarships } from '#src/services/scholarshipFallback.service.ts';
import { discoverScholarships } from '#src/services/aiScholarshipSearch.service.ts';
import { resolveCountryCode } from '#src/utils/countries.ts';
import prisma from '#src/config/database.ts';

// ── Helpers ────────────────────────────────────────────────────────────────────

async function getUserProfile(userId: string) {
  return prisma.userProfile.findUnique({ where: { userId } });
}

// ── Controllers ────────────────────────────────────────────────────────────────

const SearchQuerySchema = z.object({
  q: z.string().optional(),
  countryCode: z.string().max(10).optional(),
  level: z.enum(['BSC', 'MSC', 'PHD']).optional(),
  field: z.string().max(100).optional(),
  fundingType: z.enum(['full', 'partial', 'living', 'research']).optional(),
  financialNeed: z.string().optional(), // "true" | "false"
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

type ProfileForScore = NonNullable<Parameters<typeof computeMatchScore>[1]>;

interface MergedScholarship {
  id: string;
  title: string;
  countryCode: string | null;
  level: string | null;
  fundingType: string | null;
  minGpa: number | null;
  field: string | null;
  deadlines?: Array<{ deadline: string | Date | null }>;
  tags?: string[] | null;
  userMatchScore?: number;
  matchReasons?: string[];
  [key: string]: unknown;
}

const SOURCE_RANK: Record<string, number> = { ai: 0, serper: 0, database: 1, local: 2 };

/** Nearest deadline as an epoch (ms); unknown deadlines sort last. */
function nearestDeadline(item: MergedScholarship): number {
  const raw = item.deadlines?.[0]?.deadline;
  if (!raw) return Number.POSITIVE_INFINITY;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

/**
 * Detect a country in the free-text query. Handles exact matches
 * ("germany", "USA"), multi-word names ("united kingdom") and a country
 * mentioned alongside other terms ("germany DAAD").
 */
function detectCountryInQuery(q?: string): { code: string | null; isPureCountry: boolean } {
  const raw = q?.trim();
  if (!raw) return { code: null, isPureCountry: false };

  const whole = resolveCountryCode(raw);
  if (whole) return { code: whole, isPureCountry: true };

  const words = raw.split(/[\s,]+/).filter(Boolean);
  const grams = [...words];
  for (let i = 0; i < words.length - 1; i++) grams.push(`${words[i]} ${words[i + 1]}`);

  const hits = [...new Set(grams.map((g) => resolveCountryCode(g)).filter((c): c is string => !!c))];
  return hits.length === 1 ? { code: hits[0], isPureCountry: false } : { code: null, isPureCountry: false };
}

export async function listScholarships(req: Request & { userId?: string }, res: Response) {
  const parsed = SearchQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid query parameters', errors: parsed.error.flatten() });
    return;
  }

  const { q, countryCode, level, field, fundingType, financialNeed, page, limit } = parsed.data;
  const financialNeedBool = financialNeed === 'true' ? true : undefined;

  // ── 1. Resolve an effective country ────────────────────────────────────────
  // A country can arrive as an explicit filter OR be named in the free-text
  // query. When the query *is* just a country name we drop it as a title
  // filter so we still return that country's scholarships.
  const explicitCode = resolveCountryCode(countryCode) ?? (countryCode ? countryCode.toUpperCase() : null);
  const detected = explicitCode ? { code: null, isPureCountry: false } : detectCountryInQuery(q);
  const effectiveCountry = explicitCode ?? detected.code ?? undefined;
  const textQuery = detected.isPureCountry ? undefined : q;

  // ── 2. Load profile for personalised ranking ──────────────────────────────
  let profileForScore: ProfileForScore | null = null;
  try {
    const userProfile = req.userId ? await getUserProfile(req.userId) : null;
    if (userProfile) {
      profileForScore = {
        intendedLevel: userProfile.intendedLevel,
        intendedAbroadMajor: (userProfile as unknown as { intendedAbroadMajor?: string }).intendedAbroadMajor,
        intendedMajor: userProfile.intendedMajor,
        majorOrTrack: userProfile.majorOrTrack,
        targetCountries: userProfile.targetCountries as string[] | null,
        fundingNeed: userProfile.fundingNeed,
        gpa: userProfile.gpa,
        gpaScale: userProfile.gpaScale,
      };
    }
  } catch (err) {
    logger.warn('[scholarship:list] profile load failed', { err });
  }

  const pool = Math.max(limit * 3, 60);

  // ── 3. Query every source concurrently ───────────────────────────────────
  //   web search (OpenAI → Serper fallback) → database → bundled JSON
  const [aiOutcome, dbOutcome, localOutcome] = await Promise.all([
    discoverScholarships({
      q: textQuery,
      countryCode: effectiveCountry,
      level,
      field,
      fundingType,
      financialNeed: financialNeedBool,
      limit: Math.min(limit, 15),
    }).catch((err) => {
      logger.warn('[scholarship:list] web discovery failed', { err });
      return null;
    }),
    searchScholarships({
      q: textQuery,
      countryCode: effectiveCountry,
      level,
      field,
      fundingType,
      financialNeed: financialNeedBool,
      page: 1,
      limit: pool,
      userProfile: profileForScore,
    }).catch((err) => {
      logger.warn('[scholarship:list] database search failed', { err });
      return null;
    }),
    Promise.resolve()
      .then(() =>
        searchFallbackScholarships({
          q: textQuery,
          countryCode: effectiveCountry,
          level,
          field,
          fundingType,
          financialNeed: financialNeedBool,
          skip: 0,
          take: pool,
        }),
      )
      .catch((err) => {
        logger.warn('[scholarship:list] local search failed', { err });
        return { items: [], total: 0 };
      }),
  ]);

  // ── 4. Merge, de-duplicating by title + country ─────────────────────────
  const seen = new Set<string>();
  const merged: MergedScholarship[] = [];
  const pushAll = (items: unknown[], source: string) => {
    for (const raw of items) {
      const item = raw as MergedScholarship;
      const key = `${(item.title ?? '').toLowerCase().trim()}|${item.countryCode ?? ''}`;
      if (!item.title || seen.has(key)) continue;
      seen.add(key);
      // Shallow copy — local/fallback items come from a shared module cache and
      // must not be mutated by the ranking step below.
      merged.push({ ...item, _source: source });
    }
  };

  const aiItems = aiOutcome?.items ?? [];
  const aiSource = aiOutcome?.provider === 'serper' ? 'serper' : 'ai';
  pushAll(aiItems, aiSource);
  pushAll(dbOutcome?.items ?? [], 'database');
  pushAll(localOutcome.items ?? [], 'local');

  // ── 5. Rank ──────────────────────────────────────────────────────────────
  let personalised = false;
  if (profileForScore) {
    personalised = true;
    for (const item of merged) {
      const { score, reasons } = computeMatchScore(
        {
          level: item.level ?? null,
          countryCode: item.countryCode ?? null,
          fundingType: item.fundingType ?? null,
          minGpa: item.minGpa ?? null,
          field: item.field ?? null,
        },
        profileForScore,
      );
      item.userMatchScore = score;
      item.matchReasons = reasons;
    }
    merged.sort(
      (a, b) =>
        (b.userMatchScore ?? 0) - (a.userMatchScore ?? 0) ||
        (SOURCE_RANK[a._source as string] ?? 9) - (SOURCE_RANK[b._source as string] ?? 9) ||
        nearestDeadline(a) - nearestDeadline(b),
    );
  }
  // Without a profile the insertion order (web → database → local) is kept.

  // ── 6. Paginate ─────────────────────────────────────────────────────────
  const total = merged.length;
  const start = (page - 1) * limit;
  const items = merged.slice(start, start + limit).map(({ _source, ...rest }) => {
    void _source;
    return rest;
  });

  res.status(200).json({
    items,
    total,
    page,
    limit,
    personalised,
    source: 'hybrid',
    sources: {
      ai: aiOutcome?.provider === 'openai' ? aiItems.length : 0,
      web: aiOutcome?.provider === 'serper' ? aiItems.length : 0,
      database: dbOutcome?.items?.length ?? 0,
      local: localOutcome.items?.length ?? 0,
    },
    aiProvider: aiOutcome?.provider ?? null,
    country: effectiveCountry ?? null,
    fetchedAt: new Date().toISOString(),
  });
}

export async function getScholarship(req: Request & { userId?: string }, res: Response) {
  const id = String(req.params.id);
  try {
    const scholarship = await getScholarshipById(id);
    if (!scholarship) {
      res.status(404).json({ message: 'Scholarship not found' });
      return;
    }
    res.status(200).json(scholarship);
  } catch (err) {
    logger.error('[scholarship:get]', { err });
    res.status(500).json({ message: 'Failed to fetch scholarship' });
  }
}

export async function listUpcomingDeadlines(req: Request & { userId?: string }, res: Response) {
  const daysAhead = Number(req.query.daysAhead ?? 90);
  try {
    const deadlines = await getUpcomingDeadlines(isNaN(daysAhead) ? 90 : daysAhead);
    res.status(200).json({ deadlines });
  } catch (err) {
    logger.error('[scholarship:deadlines]', { err });
    res.status(500).json({ message: 'Failed to fetch upcoming deadlines' });
  }
}

export async function listEligibleScholarships(req: Request & { userId?: string }, res: Response) {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorised' });
    return;
  }
  try {
    const profile = await getUserProfile(userId);
    if (!profile) {
      res.status(200).json({ items: [], message: 'Complete your profile for personalised eligibility' });
      return;
    }
    const results = await getEligibleScholarships({
      gpa: profile.gpa,
      gpaScale: profile.gpaScale,
      englishTestType: profile.englishTestType,
      englishScore: profile.englishScore,
      fundingNeed: profile.fundingNeed,
      level: profile.level,
      intendedLevel: profile.intendedLevel,
      intendedAbroadMajor: (profile as unknown as { intendedAbroadMajor?: string }).intendedAbroadMajor,
      majorOrTrack: profile.majorOrTrack,
      intendedMajor: profile.intendedMajor,
      workExperienceMonths: profile.workExperienceMonths,
      graduationYear: profile.graduationYear,
      targetCountries: profile.targetCountries as string[] | null,
    });
    res.status(200).json({ items: results });
  } catch (err) {
    logger.error('[scholarship:eligible]', { err });
    res.status(500).json({ message: 'Failed to compute eligible scholarships' });
  }
}

const EligibilityBodySchema = z.object({
  profileOverride: z
    .object({
      gpa: z.number().optional(),
      gpaScale: z.string().optional(),
      englishTestType: z.string().optional(),
      englishScore: z.number().optional(),
      fundingNeed: z.boolean().optional(),
      intendedLevel: z.string().optional(),
    })
    .optional(),
});

export async function checkScholarshipEligibility(
  req: Request & { userId?: string },
  res: Response,
) {
  const id = String(req.params.id);
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorised' });
    return;
  }

  const parsed = EligibilityBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid body', errors: parsed.error.flatten() });
    return;
  }

  try {
    const profile = await getUserProfile(userId);
    const mergedProfile = {
      gpa: parsed.data.profileOverride?.gpa ?? profile?.gpa,
      gpaScale: parsed.data.profileOverride?.gpaScale ?? profile?.gpaScale,
      englishTestType: parsed.data.profileOverride?.englishTestType ?? profile?.englishTestType,
      englishScore: parsed.data.profileOverride?.englishScore ?? profile?.englishScore,
      fundingNeed: parsed.data.profileOverride?.fundingNeed ?? profile?.fundingNeed,
      level: profile?.level,
      intendedLevel: parsed.data.profileOverride?.intendedLevel ?? profile?.intendedLevel,
      intendedAbroadMajor: (profile as unknown as { intendedAbroadMajor?: string } | null)?.intendedAbroadMajor,
      majorOrTrack: profile?.majorOrTrack,
      intendedMajor: profile?.intendedMajor,
      workExperienceMonths: profile?.workExperienceMonths,
      graduationYear: profile?.graduationYear,
      targetCountries: profile?.targetCountries as string[] | null,
    };

    const result = await checkEligibility(id, mergedProfile);
    res.status(200).json(result);
  } catch (err) {
    logger.error('[scholarship:eligibility]', { err });
    res.status(500).json({ message: 'Failed to check eligibility' });
  }
}

export async function refreshScholarships(
  req: Request & { userId?: string },
  res: Response,
) {
  try {
    const result = await runLiveScholarshipRefresh({ force: true });
    res.status(200).json(result);
  } catch (err) {
    logger.error('[scholarship:refresh]', { err });
    res.status(500).json({ message: 'Live scholarship refresh failed' });
  }
}

export async function getScholarshipProbability(
  req: Request & { userId?: string },
  res: Response,
) {
  const id = String(req.params.id);
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorised' });
    return;
  }

  try {
    const profile = await getUserProfile(userId);
    if (!profile) {
      res.status(200).json({
        scholarshipId: id,
        probabilityBand: 'Low',
        probabilityPct: 20,
        factors: [],
        weaknesses: ['Complete your profile for a real assessment'],
        improvementActions: ['Go to Settings → Profile to fill in your academic details'],
        confidence: 'low',
      });
      return;
    }

    const result = await predictFundingProbability(id, {
      gpa: profile.gpa,
      gpaScale: profile.gpaScale,
      englishTestType: profile.englishTestType,
      englishScore: profile.englishScore,
      fundingNeed: profile.fundingNeed,
      level: profile.level,
      intendedLevel: profile.intendedLevel,
      intendedAbroadMajor: (profile as unknown as { intendedAbroadMajor?: string }).intendedAbroadMajor,
      majorOrTrack: profile.majorOrTrack,
      intendedMajor: profile.intendedMajor,
      workExperienceMonths: profile.workExperienceMonths,
      graduationYear: profile.graduationYear,
      targetCountries: profile.targetCountries as string[] | null,
    });
    res.status(200).json(result);
  } catch (err) {
    logger.error('[scholarship:probability]', { err });
    res.status(500).json({ message: 'Failed to compute funding probability' });
  }
}
