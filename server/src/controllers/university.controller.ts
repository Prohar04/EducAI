import { Request, Response } from 'express';
import prisma from '#src/config/database.ts';
import { Prisma } from '../generated/client.ts';
import { searchFallbackUniversities } from '#src/services/universityFallback.service.ts';

// ── Controllers ────────────────────────────────────────────────────────────────

/**
 * GET /universities/search
 * Search for universities by country code and name with pagination.
 * Query parameters:
 *   - country: ISO 3166-1 alpha-2 country code (e.g., 'US', 'CA', 'UK')
 *   - q: search term to match university name
 *   - page: page number (default 1)
 *   - limit: results per page, max 100 (default 20)
 * Returns paginated list of universities with country details.
 *
 * If the primary (database) search throws or has no rows, this falls back to the
 * bundled static dataset in `server/src/data` so the endpoint still returns
 * results. Fallback responses are flagged with `source: 'fallback'`.
 */
export const searchUniversities = async (req: Request, res: Response) => {
  const { country, q, page = '1', limit = '20' } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  // Only surface universities whose data has been refreshed within the last 10 days.
  const MAX_DATA_AGE_MS = 10 * 24 * 60 * 60 * 1000;
  const freshSince = new Date(Date.now() - MAX_DATA_AGE_MS);

  const respondWithFallback = (reason: 'empty' | 'error') => {
    const { items, total } = searchFallbackUniversities({ country, q, skip, take: limitNum });
    const noDataMessage = total === 0 ? 'No matching universities found.' : undefined;
    return res.status(200).json({
      items,
      page: pageNum,
      limit: limitNum,
      total,
      source: 'fallback',
      fallbackReason: reason,
      ...(noDataMessage && { noDataMessage }),
    });
  };

  try {
    const where: Prisma.UniversityWhereInput = {
      updatedAt: { gte: freshSince },
    };
    if (country) where.country = { code: country.toUpperCase() };
    if (q) where.name = { contains: q, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      prisma.university.findMany({
        where,
        skip,
        take: limitNum,
        include: { country: true },
        orderBy: { name: 'asc' },
      }),
      prisma.university.count({ where }),
    ]);

    if (total === 0) return respondWithFallback('empty');

    res.status(200).json({ items, page: pageNum, limit: limitNum, total, source: 'database' });
  } catch {
    try {
      return respondWithFallback('error');
    } catch {
      return res.status(500).json({ message: 'Failed to search universities' });
    }
  }
};
