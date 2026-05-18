import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticateCron } from '#src/middlewares/authenticateCron.ts';
import { backgroundRefreshAll } from '#src/services/jobService.ts';
import { runDataSync } from '#src/services/dataSync.service.ts';
import logger from '#src/config/logger.ts';

const router = Router();

// All cron endpoints require CRON_SECRET authentication
// These are called by GitHub Actions scheduled workflows

// POST /api/cron/jobs/refresh - refresh job data from external APIs
router.post('/jobs/refresh', authenticateCron, async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.info('[cron] Starting jobs data refresh');
    const result = await backgroundRefreshAll();
    logger.info('[cron] Jobs refresh completed');
    res.json({ success: true, data: result });
  } catch (err) {
    logger.error('[cron] jobs refresh error:', { err });
    res.status(500).json({ error: 'Job refresh failed' });
  }
});

// POST /api/cron/news/refresh - refresh news cache
router.post('/news/refresh', authenticateCron, async (req: Request, res: Response): Promise<void> => {
  try {
    const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:8001';
    const AI_SERVER_API_KEY = process.env.AI_SERVER_API_KEY || '';

    const aiRes = await fetch(`${AI_SERVER_URL}/api/v1/news/refresh`, {
      method: 'POST',
      headers: { 'X-API-Key': AI_SERVER_API_KEY },
      signal: AbortSignal.timeout(90000),
    });

    if (!aiRes.ok) {
      logger.warn('[cron] news refresh: AI server returned ' + aiRes.status);
      res.json({ success: false, message: 'AI server unavailable', timestamp: new Date().toISOString() });
      return;
    }

    const data = await aiRes.json();
    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (err) {
    logger.error('[cron] news refresh error:', { err });
    res.status(500).json({ error: 'News refresh failed' });
  }
});

// POST /api/cron/freshness/update - update data freshness records
router.post('/freshness/update', authenticateCron, async (req: Request, res: Response): Promise<void> => {
  try {
    const { source, recordCount, status, details } = req.body as {
      source: string;
      recordCount?: number;
      status?: string;
      details?: Record<string, unknown>;
    };

    if (!source) {
      res.status(400).json({ error: 'source is required' });
      return;
    }

    const SOURCE_NEXT_HOURS: Record<string, number> = {
      jobs: 1, news: 1, currency: 6,
      scholarships: 24, programs: 24, visa: 24, professors: 24,
    };

    const prisma = (await import('#src/config/database.ts')).default;

    const hours = SOURCE_NEXT_HOURS[source] ?? 24;
    await prisma.dataFreshness.upsert({
      where: { source },
      update: {
        lastSyncAt: new Date(),
        status: status ?? 'success',
        recordCount: recordCount ?? 0,
        details: details ? JSON.stringify(details) : null,
        nextSyncAt: new Date(Date.now() + hours * 3600000),
        errorMessage: null,
      },
      create: {
        source,
        lastSyncAt: new Date(),
        status: status ?? 'success',
        recordCount: recordCount ?? 0,
        nextSyncAt: new Date(Date.now() + hours * 3600000),
      },
    });

    res.json({ ok: true, source });
  } catch (err) {
    logger.error('[cron] freshness update error:', { err });
    res.status(500).json({ error: 'Freshness update failed' });
  }
});

// POST /api/cron/refresh-programs - refresh programs data from external source
router.post('/refresh-programs', authenticateCron, async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.info('[cron] Starting programs data refresh');
    const result = await runDataSync('programs', 'cron', 'cron');
    logger.info('[cron] Programs refresh completed:', { status: result.status });

    // Keep DataFreshness in sync so the /freshness endpoint reflects the latest state
    const prisma = (await import('#src/config/database.ts')).default;
    await prisma.dataFreshness.upsert({
      where: { source: 'programs' },
      update: {
        lastSyncAt: new Date(),
        status: result.status === 'success' || result.status === 'partial_success' ? 'success' : 'error',
        recordCount: result.recordsProcessed,
        nextSyncAt: new Date(Date.now() + 24 * 3600000),
        errorMessage: result.errorSummary ?? null,
      },
      create: {
        source: 'programs',
        lastSyncAt: new Date(),
        status: result.status === 'success' || result.status === 'partial_success' ? 'success' : 'error',
        recordCount: result.recordsProcessed,
        nextSyncAt: new Date(Date.now() + 24 * 3600000),
      },
    });

    res.json({ success: true, target: 'programs', status: result.status, finishedAt: result.finishedAt });
  } catch (err) {
    logger.error('[cron] programs refresh error:', { err });
    res.status(500).json({ error: 'Programs refresh failed' });
  }
});

// POST /api/cron/refresh-scholarships - refresh scholarships data from external source
router.post('/refresh-scholarships', authenticateCron, async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.info('[cron] Starting scholarships data refresh');
    const result = await runDataSync('scholarships', 'cron', 'cron');
    logger.info('[cron] Scholarships refresh completed:', { status: result.status });

    // Keep DataFreshness in sync so the /freshness endpoint reflects the latest state
    const prisma = (await import('#src/config/database.ts')).default;
    await prisma.dataFreshness.upsert({
      where: { source: 'scholarships' },
      update: {
        lastSyncAt: new Date(),
        status: result.status === 'success' || result.status === 'partial_success' ? 'success' : 'error',
        recordCount: result.recordsProcessed,
        nextSyncAt: new Date(Date.now() + 24 * 3600000),
        errorMessage: result.errorSummary ?? null,
      },
      create: {
        source: 'scholarships',
        lastSyncAt: new Date(),
        status: result.status === 'success' || result.status === 'partial_success' ? 'success' : 'error',
        recordCount: result.recordsProcessed,
        nextSyncAt: new Date(Date.now() + 24 * 3600000),
      },
    });

    res.json({ success: true, target: 'scholarships', status: result.status, finishedAt: result.finishedAt });
  } catch (err) {
    logger.error('[cron] scholarships refresh error:', { err });
    res.status(500).json({ error: 'Scholarships refresh failed' });
  }
});

// POST /api/cron/refresh-news - alias for /news/refresh (called by freshness-sync workflow)
router.post('/refresh-news', authenticateCron, async (_req: Request, res: Response): Promise<void> => {
  try {
    const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:8001';
    const AI_SERVER_API_KEY = process.env.AI_SERVER_API_KEY || '';

    const aiRes = await fetch(`${AI_SERVER_URL}/api/v1/news/refresh`, {
      method: 'POST',
      headers: { 'X-API-Key': AI_SERVER_API_KEY },
      signal: AbortSignal.timeout(90000),
    });

    if (!aiRes.ok) {
      logger.warn('[cron] refresh-news: AI server returned ' + aiRes.status);
      res.json({ success: false, message: 'AI server unavailable', timestamp: new Date().toISOString() });
      return;
    }

    const data = await aiRes.json();
    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (err) {
    logger.error('[cron] refresh-news error:', { err });
    res.status(500).json({ error: 'News refresh failed' });
  }
});

// POST /api/cron/refresh-visa - refresh visa/timeline data (placeholder - no external source yet)
router.post('/refresh-visa', authenticateCron, async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.info('[cron] Visa data refresh called - no external source configured');
    // TODO: Add visa data refresh when external source is available
    res.json({ success: true, message: 'Visa refresh not implemented - no external source', timestamp: new Date().toISOString() });
  } catch (err) {
    logger.error('[cron] visa refresh error:', { err });
    res.status(500).json({ error: 'Visa refresh failed' });
  }
});

export default router;