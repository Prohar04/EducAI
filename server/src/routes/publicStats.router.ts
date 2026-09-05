import { Router } from 'express';
import prisma from '#src/config/database.ts';
import logger from '#src/config/logger.ts';

const router = Router();

/**
 * GET /public/stats
 *
 * Counts for the marketing site. Public and unauthenticated by design — it
 * exposes nothing but totals.
 *
 * These numbers were previously hardcoded in the landing page and had drifted
 * out of step with the application, which showed three different scholarship
 * counts across four screens.
 */
router.get('/stats', async (_req, res) => {
  try {
    const [scholarships, programs, universities, countries] = await Promise.all([
      prisma.scholarship.count({ where: { isActive: true } }),
      prisma.program.count(),
      prisma.university.count(),
      prisma.country.count(),
    ]);

    // Safe to cache hard: these move on a sync cadence, not per request.
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
    res.status(200).json({ scholarships, programs, universities, countries });
  } catch (err) {
    logger.error('[publicStats] failed', { err });
    res.status(503).json({ error: 'Stats unavailable' });
  }
});

export default router;
