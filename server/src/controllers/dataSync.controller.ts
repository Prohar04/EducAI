import type { Request, Response } from 'express';
import {
  runDataSync,
  getSyncStatus,
  getSyncHistory,
  getJobDetails,
  cancelJob,
  type SyncTarget,
} from '#src/services/dataSync.service.ts';
import logger from '#src/config/logger.ts';

function getAuthContext(req: Request): { isAuthorized: boolean; isCron: boolean; userId: string | undefined } {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization ?? '';
  const isCron = !!(cronSecret && authHeader === `Bearer ${cronSecret}`);
  const userId = (req as unknown as { userId?: string }).userId;
  return { isAuthorized: !!userId || isCron, isCron, userId };
}

export async function dataSyncRunHandler(req: Request, res: Response): Promise<void> {
  const { isAuthorized, isCron, userId } = getAuthContext(req);

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
    const limit = Math.min(Number(req.query.limit ?? 20), 100);
    const history = await getSyncHistory(limit);
    res.status(200).json({ runs: history, total: history.length });
  } catch (err) {
    logger.error(`[dataSync] history fetch failed: ${err}`);
    res.status(500).json({ error: 'Failed to retrieve sync history.' });
  }
}

export async function dataSyncJobDetailsHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id ?? '');
    if (!id) { res.status(400).json({ error: 'Job ID required' }); return; }
    const job = await getJobDetails(id);
    if (!job) { res.status(404).json({ error: 'Job not found' }); return; }
    res.status(200).json(job);
  } catch (err) {
    logger.error(`[dataSync] job details failed: ${err}`);
    res.status(500).json({ error: 'Failed to retrieve job details.' });
  }
}

export async function dataSyncCancelHandler(req: Request, res: Response): Promise<void> {
  const { isAuthorized } = getAuthContext(req);
  if (!isAuthorized) { res.status(403).json({ error: 'Forbidden' }); return; }

  try {
    const id = String(req.params.id ?? '');
    if (!id) { res.status(400).json({ error: 'Job ID required' }); return; }
    const result = await cancelJob(id);
    res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    logger.error(`[dataSync] cancel failed: ${err}`);
    res.status(500).json({ error: 'Failed to cancel job.' });
  }
}

export async function dataSyncRetryHandler(req: Request, res: Response): Promise<void> {
  const { isAuthorized, isCron, userId } = getAuthContext(req);
  if (!isAuthorized) { res.status(403).json({ error: 'Forbidden' }); return; }

  const { target = 'all' } = req.body as { target?: SyncTarget };
  const validTargets: SyncTarget[] = ['scholarships', 'programs', 'all'];
  if (!validTargets.includes(target)) {
    res.status(400).json({ error: 'target must be scholarships | programs | all' });
    return;
  }

  logger.info(`[dataSync] retry target=${target} by=${userId ?? 'cron'}`);

  try {
    const result = await runDataSync(target, isCron ? 'cron' : 'manual', userId ?? 'cron');

    if (result.status === 'running' && !result.finishedAt) {
      res.status(409).json(result);
      return;
    }

    const httpStatus = result.status === 'failed' ? 207 : 200;
    res.status(httpStatus).json(result);
  } catch (err) {
    logger.error(`[dataSync] retry unexpected error: ${err}`);
    res.status(500).json({ error: 'Retry failed unexpectedly.' });
  }
}
