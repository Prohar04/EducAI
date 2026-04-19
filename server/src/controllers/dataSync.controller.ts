import type { Request, Response } from 'express';
import { runDataSync, getSyncStatus, type SyncTarget } from '#src/services/dataSync.service.ts';
import logger from '#src/config/logger.ts';

export async function dataSyncRunHandler(req: Request, res: Response): Promise<void> {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization ?? '';
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
  const userId = (req as unknown as { userId?: string }).userId;
  const isAdmin = !!userId; // any authenticated user can trigger manual sync

  if (!isAdmin && !isCron) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const { target = 'all' } = req.body as { target?: SyncTarget };
  const validTargets: SyncTarget[] = ['scholarships', 'programs', 'all'];
  if (!validTargets.includes(target)) {
    res.status(400).json({ error: 'target must be scholarships | programs | all' });
    return;
  }

  const triggeredBy = isCron ? 'cron' : 'manual';
  logger.info(`[dataSync] trigger by ${triggeredBy} for target=${target}`);

  try {
    const result = await runDataSync(target, triggeredBy);
    res.status(result.status === 'failed' ? 207 : 200).json(result);
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
