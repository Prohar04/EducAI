import { Request, Response } from 'express';
import prisma from '#src/config/database.ts';
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

// ── Controllers ────────────────────────────────────────────────────────────────

/**
 * GET /programs
 * Search for academic programs with advanced filtering options.
 * Query parameters:
 *   - country: ISO 3166-1 alpha-2 country code
 *   - level: program level (BSC, MSC, PHD)
 *   - field: subject field or discipline
 *   - q: general search term (matches title, field, or university name)
 *   - page: pagination page number (default 1)
 *   - limit: results per page, max 100 (default 20)
 * Returns paginated programs with university and country details, including
 * freshness status so the UI can display data quality indicators.
 */
export const searchPrograms = async (req: Request, res: Response) => {
  try {
    const { country, level, field, q, page = '1', limit = '20', showStale = 'false' } = req.query as Record<string, string>;
    const freshOnly = showStale !== 'true';
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Base filters (country, level, field, text search)
    const baseWhere: Prisma.ProgramWhereInput = {};
    if (country) baseWhere.university = { country: { code: country.toUpperCase() } };
    if (level && Object.values(ProgramLevel).includes(level as ProgramLevel)) {
      baseWhere.level = level as ProgramLevel;
    }
    if (field) baseWhere.field = { contains: field, mode: 'insensitive' };
    if (q) {
      baseWhere.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { field: { contains: q, mode: 'insensitive' } },
        { university: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    // Fresh = lastVerifiedAt within 7 days, or updatedAt within 7 days when lastVerifiedAt is null
    const freshFilter: Prisma.ProgramWhereInput = {
      OR: [
        { lastVerifiedAt: { gte: sevenDaysAgo } },
        { AND: [{ lastVerifiedAt: null }, { updatedAt: { gte: sevenDaysAgo } }] },
      ],
    };

    // Stale = NOT fresh (used to count hidden programs)
    const staleFilter: Prisma.ProgramWhereInput = {
      OR: [
        { AND: [{ lastVerifiedAt: { not: null } }, { lastVerifiedAt: { lt: sevenDaysAgo } }] },
        { AND: [{ lastVerifiedAt: null }, { updatedAt: { lt: sevenDaysAgo } }] },
      ],
    };

    const where: Prisma.ProgramWhereInput = freshOnly
      ? { AND: [baseWhere, freshFilter] }
      : baseWhere;

    const [items, total, staleHiddenCount] = await Promise.all([
      prisma.program.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          university: { include: { country: true } },
        },
        orderBy: [{ university: { name: 'asc' } }, { title: 'asc' }],
      }),
      prisma.program.count({ where }),
      freshOnly
        ? prisma.program.count({ where: { AND: [baseWhere, staleFilter] } })
        : Promise.resolve(0),
    ]);

    const enriched = items.map(attachFreshness);

    // Among shown results, count how many are cached/stale (relevant only when showStale=true)
    const shownStaleCount = enriched.filter(
      (p) => p.freshnessStatus === 'stale' || p.freshnessStatus === 'cached' || p.freshnessStatus === 'source_unavailable',
    ).length;
    const hasStaleData = shownStaleCount > 0 && !freshOnly;

    res.status(200).json({
      items: enriched,
      page: pageNum,
      limit: limitNum,
      total,
      freshOnlyMode: freshOnly,
      staleHiddenCount,
      hasStaleData,
      staleCount: shownStaleCount,
    });
  } catch {
    res.status(500).json({ message: 'Failed to search programs' });
  }
};

/**
 * GET /programs/:id
 * Fetch complete program details including requirements and application deadlines.
 * Returns university information, admission requirements, and all deadline records.
 * Includes computed freshnessStatus so the UI can display a data-quality badge.
 */
export const getProgramById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        university: { include: { country: true } },
        requirements: { orderBy: { key: 'asc' } },
        deadlines: { orderBy: { deadline: 'asc' } },
      },
    });

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    res.status(200).json(attachFreshness(program));
  } catch {
    res.status(500).json({ message: 'Failed to fetch program' });
  }
};
