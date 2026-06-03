import { Response } from 'express';
import prisma from '#src/config/database.ts';
import { AuthRequest } from '#src/types/authRequest.type.ts';
import { Prisma, ProgramLevel } from '../generated/client.ts';

// ── Freshness helpers ──────────────────────────────────────────────────────────

type FreshnessStatus = 'live' | 'recent' | 'cached' | 'stale' | 'source_unavailable';

function computeFreshnessStatus(lastVerifiedAt: Date | null, updatedAt: Date): FreshnessStatus {
  const ref = lastVerifiedAt ?? updatedAt;
  const diffDays = (Date.now() - ref.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 1)  return 'live';
  if (diffDays < 7)  return 'recent';
  if (diffDays < 30) return 'cached';
  return 'stale';
}

function attachFreshness<T extends { lastVerifiedAt: Date | null; updatedAt: Date }>(
  program: T,
): T & { freshnessStatus: FreshnessStatus } {
  return { ...program, freshnessStatus: computeFreshnessStatus(program.lastVerifiedAt, program.updatedAt) };
}

// ── Profile-aware ranking ──────────────────────────────────────────────────────

interface UserProfile {
  targetCountry:   string | null;
  targetCountries: unknown;       // JSON — string[]
  intendedLevel:   string | null;
  level:           string | null;
  majorOrTrack:    string | null;
  intendedMajor:   string | null;
  budgetMax:       number | null;
  budgetAmountUSD: number | null;
}

type ScoredProgram<T> = T & { freshnessStatus: FreshnessStatus; _profileScore: number };

function scoreProgram<
  T extends {
    level: string;
    field: string;
    tuitionMinUSD: number | null;
    tuitionMaxUSD: number | null;
    university: { country: { code: string } };
  }
>(program: T, profile: UserProfile): number {
  let score = 0;

  // Country match — use targetCountries array first, fall back to targetCountry string
  const rawCountries = profile.targetCountries;
  const countryList: string[] = Array.isArray(rawCountries)
    ? (rawCountries as string[]).map((c) => c.toUpperCase())
    : profile.targetCountry
    ? [profile.targetCountry.toUpperCase()]
    : [];

  if (countryList.includes(program.university.country.code.toUpperCase())) score += 30;

  // Degree level match
  const targetLevel = profile.intendedLevel ?? profile.level ?? null;
  if (targetLevel && program.level === targetLevel) score += 20;

  // Field / major match (substring, case-insensitive)
  const major = (profile.majorOrTrack ?? profile.intendedMajor ?? '').toLowerCase();
  if (major && program.field.toLowerCase().includes(major)) score += 20;

  // Budget fit — allow 10% overshoot to catch close matches
  const budgetUSD = profile.budgetAmountUSD ?? profile.budgetMax ?? null;
  if (
    budgetUSD != null &&
    program.tuitionMaxUSD != null &&
    program.tuitionMaxUSD <= budgetUSD * 1.1
  ) {
    score += 10;
  }

  return score;
}

// ── Controllers ────────────────────────────────────────────────────────────────

/**
 * GET /programs
 *
 * When the request carries a valid Bearer token (populated by optionalAuthMiddleware),
 * the controller fetches the user's profile and applies global profile-aware ranking
 * across ALL matching programs before paginating. This ensures the best-matching
 * programs surface on page 1 regardless of alphabetical order.
 *
 * Without a token the behaviour is identical to before: paginated DB results ordered
 * by university name then title.
 */
export const searchPrograms = async (req: AuthRequest, res: Response) => {
  try {
    const {
      country,
      level,
      field,
      q,
      page      = '1',
      limit     = '20',
      showStale = 'false',
    } = req.query as Record<string, string>;

    const freshOnly = showStale !== 'true';
    const pageNum   = Math.max(1, parseInt(page) || 1);
    const limitNum  = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip      = (pageNum - 1) * limitNum;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // ── Build where clause ──────────────────────────────────────────────────
    const baseWhere: Prisma.ProgramWhereInput = {};
    if (country) baseWhere.university = { country: { code: country.toUpperCase() } };
    if (level && Object.values(ProgramLevel).includes(level as ProgramLevel)) {
      baseWhere.level = level as ProgramLevel;
    }
    if (field) baseWhere.field = { contains: field, mode: 'insensitive' };
    if (q) {
      baseWhere.OR = [
        { title:      { contains: q, mode: 'insensitive' } },
        { field:      { contains: q, mode: 'insensitive' } },
        { university: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const freshFilter: Prisma.ProgramWhereInput = {
      OR: [
        { lastVerifiedAt: { gte: sevenDaysAgo } },
        { AND: [{ lastVerifiedAt: null }, { updatedAt: { gte: sevenDaysAgo } }] },
      ],
    };
    const staleFilter: Prisma.ProgramWhereInput = {
      OR: [
        { AND: [{ lastVerifiedAt: { not: null } }, { lastVerifiedAt: { lt: sevenDaysAgo } }] },
        { AND: [{ lastVerifiedAt: null }, { updatedAt: { lt: sevenDaysAgo } }] },
      ],
    };

    const where: Prisma.ProgramWhereInput = freshOnly
      ? { AND: [baseWhere, freshFilter] }
      : baseWhere;

    // ── Attempt to load user profile for ranking ────────────────────────────
    let profile: UserProfile | null = null;
    if (req.userId) {
      try {
        profile = await prisma.userProfile.findUnique({
          where: { userId: req.userId },
          select: {
            targetCountry:   true,
            targetCountries: true,
            intendedLevel:   true,
            level:           true,
            majorOrTrack:    true,
            intendedMajor:   true,
            budgetMax:       true,
            budgetAmountUSD: true,
          },
        });
      } catch {
        // Profile fetch failure must not break the response — fall back to unranked
        profile = null;
      }
    }

    // ── Profile-ranked path: fetch all, score, sort, paginate in-memory ─────
    if (profile) {
      const includeClause = {
        university: { include: { country: true } },
      };

      const [allItems, staleHiddenCount] = await Promise.all([
        prisma.program.findMany({
          where,
          include: includeClause,
          orderBy: [{ university: { name: 'asc' } }, { title: 'asc' }],
        }),
        freshOnly
          ? prisma.program.count({ where: { AND: [baseWhere, staleFilter] } })
          : Promise.resolve(0),
      ]);

      const enriched = allItems.map((p) => {
        const withFreshness = attachFreshness(p);
        return { ...withFreshness, _profileScore: scoreProgram(p, profile!) };
      }) as ScoredProgram<typeof allItems[number] & { freshnessStatus: FreshnessStatus }>[];

      // Sort: highest profile score first, then alphabetically as tiebreaker
      enriched.sort((a, b) =>
        b._profileScore !== a._profileScore
          ? b._profileScore - a._profileScore
          : a.university.name.localeCompare(b.university.name) || a.title.localeCompare(b.title),
      );

      const total    = enriched.length;
      const page_items = enriched.slice(skip, skip + limitNum);

      const shownStaleCount = page_items.filter(
        (p) => p.freshnessStatus === 'stale' || p.freshnessStatus === 'cached' || p.freshnessStatus === 'source_unavailable',
      ).length;

      return res.status(200).json({
        items:            page_items,
        page:             pageNum,
        limit:            limitNum,
        total,
        freshOnlyMode:    freshOnly,
        staleHiddenCount,
        hasStaleData:     shownStaleCount > 0 && !freshOnly,
        staleCount:       shownStaleCount,
        profileRanked:    true,
      });
    }

    // ── Default path: paginated DB query (unauthenticated or no profile) ────
    const [items, total, staleHiddenCount] = await Promise.all([
      prisma.program.findMany({
        where,
        skip,
        take:    limitNum,
        include: { university: { include: { country: true } } },
        orderBy: [{ university: { name: 'asc' } }, { title: 'asc' }],
      }),
      prisma.program.count({ where }),
      freshOnly
        ? prisma.program.count({ where: { AND: [baseWhere, staleFilter] } })
        : Promise.resolve(0),
    ]);

    const enriched = items.map(attachFreshness);

    const shownStaleCount = enriched.filter(
      (p) => p.freshnessStatus === 'stale' || p.freshnessStatus === 'cached' || p.freshnessStatus === 'source_unavailable',
    ).length;

    return res.status(200).json({
      items:            enriched,
      page:             pageNum,
      limit:            limitNum,
      total,
      freshOnlyMode:    freshOnly,
      staleHiddenCount,
      hasStaleData:     shownStaleCount > 0 && !freshOnly,
      staleCount:       shownStaleCount,
      profileRanked:    false,
    });
  } catch {
    res.status(500).json({ message: 'Failed to search programs' });
  }
};

/**
 * GET /programs/:id
 */
export const getProgramById = async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const program = await prisma.program.findUnique({
      where:   { id },
      include: {
        university:   { include: { country: true } },
        requirements: { orderBy: { key: 'asc' } },
        deadlines:    { orderBy: { deadline: 'asc' } },
      },
    });

    if (!program) return res.status(404).json({ message: 'Program not found' });

    res.status(200).json(attachFreshness(program));
  } catch {
    res.status(500).json({ message: 'Failed to fetch program' });
  }
};
