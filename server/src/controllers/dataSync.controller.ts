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

export async function dataSyncRunHandler(req: Request, res: Response): Promise<void> {
  const { target = 'all' } = req.body as { target?: SyncTarget };
  const validTargets: SyncTarget[] = ['scholarships', 'programs', 'all'];
  if (!validTargets.includes(target)) {
    res.status(400).json({ error: 'target must be scholarships | programs | all' });
    return;
  }

  logger.info(`[dataSync] trigger type=cron target=${target} by=cron`);

  try {
    const result = await runDataSync(target, 'cron', 'cron');

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
  const { target = 'all' } = req.body as { target?: SyncTarget };
  const validTargets: SyncTarget[] = ['scholarships', 'programs', 'all'];
  if (!validTargets.includes(target)) {
    res.status(400).json({ error: 'target must be scholarships | programs | all' });
    return;
  }

  logger.info(`[dataSync] retry target=${target} by=cron`);

  try {
    const result = await runDataSync(target, 'cron', 'cron');

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
