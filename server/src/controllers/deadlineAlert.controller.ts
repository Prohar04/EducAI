/**
 * deadlineAlert.controller.ts
 *
 * Endpoints:
 *   POST /deadline-alerts/run            — trigger the alert job (protected by CRON_SECRET)
 *   GET  /deadline-alerts/pending        — preview pending alerts for the current user
 *   GET  /deadline-alerts/recent         — recent alerts sent to the current user (notification panel)
 *   GET  /deadline-alerts/count          — unread count for nav badge
 */
import { Response, Request } from 'express';
import { AuthRequest } from '#src/types/authRequest.type.ts';
import {
  runDeadlineAlertJob,
  findPendingAlerts,
  getRecentAlerts,
  getRecentAlertCount,
} from '#src/services/deadlineAlert.service.ts';

// POST /deadline-alerts/run
// Auth handled by authenticateCron middleware in the router.
export const triggerAlertRun = async (req: Request, res: Response) => {
  try {
    const result = await runDeadlineAlertJob();
    console.info('[deadline-alerts:run] completed', result);
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    console.error('[deadline-alerts:run]', err);
    res.status(500).json({ message: 'Alert job failed', error: (err as Error).message });
  }
};

// GET /deadline-alerts/pending
// Returns alerts that would be sent on the next job run, for the calling user.
export const listPendingAlerts = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  try {
    const all = await findPendingAlerts();
    const forUser = all.filter((a) => a.userId === userId).map((a) => ({
      scholarshipId: a.scholarshipId,
      scholarshipTitle: a.scholarshipTitle,
      provider: a.provider,
      deadlineDate: a.deadline.toISOString(),
      daysLeft: a.daysLeft,
      alertWindow: a.daysWindow,
      scholarshipUrl: a.scholarshipUrl,
      amount: a.amount,
    }));
    res.status(200).json({ alerts: forUser });
  } catch (err) {
    console.error('[deadline-alerts:pending]', err);
    res.status(500).json({ message: 'Failed to fetch pending alerts' });
  }
};

// GET /deadline-alerts/recent
// Returns recent alert history for the notification panel.
export const listRecentAlerts = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  try {
    const alerts = await getRecentAlerts(userId);
    res.status(200).json({ alerts });
  } catch (err) {
    console.error('[deadline-alerts:recent]', err);
    res.status(500).json({ message: 'Failed to fetch recent alerts' });
  }
};

// GET /deadline-alerts/count
// Returns the unread notification count for the nav badge.
export const getAlertCount = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  try {
    const count = await getRecentAlertCount(userId);
    res.status(200).json({ count });
  } catch (err) {
    console.error('[deadline-alerts:count]', err);
    res.status(500).json({ count: 0 });
  }
};
