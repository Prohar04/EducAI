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
    const { country, level, field, q, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ProgramWhereInput = {};
    if (country) where.university = { country: { code: country.toUpperCase() } };
    if (level && Object.values(ProgramLevel).includes(level as ProgramLevel)) {
      where.level = level as ProgramLevel;
    }
    if (field) where.field = { contains: field, mode: 'insensitive' };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { field: { contains: q, mode: 'insensitive' } },
        { university: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
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
    ]);

    const enriched = items.map(attachFreshness);

    // Staleness summary: fraction of results that are stale helps the UI decide
    // whether to show a global refresh prompt.
    const staleCount = enriched.filter(
      (p) => p.freshnessStatus === 'stale' || p.freshnessStatus === 'source_unavailable',
    ).length;
    const hasStaleData = staleCount > 0 && total > 0;

    const noDataMessage = total === 0 ? 'No program data yet. Trigger a sync to discover programmes.' : undefined;

    res.status(200).json({
      items: enriched,
      page: pageNum,
      limit: limitNum,
      total,
      hasStaleData,
      staleCount,
      ...(noDataMessage && { noDataMessage }),
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
