import type { Request, Response } from 'express';
import { intelligentSearch, getRecentSearches } from '#src/services/search.service.ts';
import logger from '#src/config/logger.ts';

/**
 * POST /search/intelligent
 * Body: { query: string }
 *
 * Runs NLP intent → LLM query rewrite → Serper search → PostgreSQL cache.
 * Returns cached results immediately on HIT.
 */
export async function intelligentSearchHandler(req: Request, res: Response): Promise<void> {
  const { query } = req.body as { query?: string };

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    res.status(400).json({ error: 'query is required and must be a non-empty string' });
    return;
  }

  if (query.length > 500) {
    res.status(400).json({ error: 'query must be 500 characters or fewer' });
    return;
  }

  try {
    logger.info(`[search] intelligent search: "${query.substring(0, 100)}"`);
    const result = await intelligentSearch(query.trim());
    logger.info(`[search] ${result.cacheHit ? 'CACHE HIT' : 'CACHE MISS'} for query="${query.substring(0, 60)}..." results=${result.results.length}`);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`[search] intelligent search error: ${err}`);
    res.status(500).json({ error: 'Search service temporarily unavailable' });
  }
}

/**
 * GET /search/cached
 * Query: ?limit=20
 *
 * Returns recently cached searches (for debug/transparency).
 */
export async function listCachedSearches(req: Request, res: Response): Promise<void> {
  const limit = Math.min(parseInt(req.query.limit as string ?? '20', 10), 100);

  try {
    const searches = await getRecentSearches(isNaN(limit) ? 20 : limit);
    res.status(200).json({ count: searches.length, searches });
  } catch (err) {
    logger.error(`[search] list cached searches error: ${err}`);
    res.status(500).json({ error: 'Failed to fetch cached searches' });
  }
}
