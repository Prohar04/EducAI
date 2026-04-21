import type { Request, Response } from 'express';
import {
  runDataSync,
  getSyncStatus,
  getSyncHistory,
  type SyncTarget,
} from '#src/services/dataSync.service.ts';
import logger from '#src/config/logger.ts';

export async function dataSyncRunHandler(req: Request, res: Response): Promise<void> {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization ?? '';
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
  const userId = (req as unknown as { userId?: string }).userId;
  const isAuthorized = !!userId || isCron;

  if (!isAuthorized) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const { target = 'all' } = req.body as { target?: SyncTarget };
  const validTargets: SyncTarget[] = ['scholarships', 'programs', 'all'];
  if (!validTargets.includes(target)) {
    res.status(400).json({ error: 'target must be scholarships | programs | all' });
    return;
  }

  const triggerType = isCron ? 'cron' : 'manual';
  const triggeredBy = userId ?? 'cron';

  logger.info(`[dataSync] trigger type=${triggerType} target=${target} by=${triggeredBy}`);

  try {
    const result = await runDataSync(target, triggerType, triggeredBy);

    // Already-running returns status 'running' with no finishedAt — use 409 Conflict
    if (result.status === 'running' && !result.finishedAt) {
      res.status(409).json(result);
      return;
    }

    const httpStatus = result.status === 'failed' ? 207 : 200;
    res.status(httpStatus).json(result);
  } catch (err) {
    logger.error(`[dataSync] unexpected error: ${err}`);
    res.status(500).json({ error: 'Sync failed unexpectedly. Check server logs.' });
  }
}

export async function dataSyncStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const status = await getSyncStatus();
    res.status(200).json(status);
  } catch (err) {
    logger.error(`[dataSync] status check failed: ${err}`);
    res.status(500).json({ error: 'Failed to retrieve sync status.' });
  }
}

export async function dataSyncHistoryHandler(req: Request, res: Response): Promise<void> {
  try {
    const limit = Math.min(Number(req.query.limit ?? 20), 50);
    const history = await getSyncHistory(limit);
    res.status(200).json({ runs: history, total: history.length });
  } catch (err) {
    logger.error(`[dataSync] history fetch failed: ${err}`);
    res.status(500).json({ error: 'Failed to retrieve sync history.' });
  }
}
