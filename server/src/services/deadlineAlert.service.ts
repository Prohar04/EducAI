/**
 * deadlineAlert.service.ts
 *
 * Scholarship deadline alert system.
 *
 * Design:
 *   - Alert windows: 30, 14, 7, and 1 days before each scholarship deadline
 *   - Idempotent: ScholarshipAlertLog prevents duplicate alerts per (user, deadline, window, channel)
 *   - Email provider: uses the existing email.service adapter (console in dev, SMTP in prod)
 *   - In-app: unread count is derived by counting alert logs from the last 30 days
 *
 * Trigger options:
 *   1. Cron job (external scheduler hits POST /api/deadline-alerts/run with a secret header)
 *   2. Manual trigger from the admin / scheduled task (same endpoint)
 *   3. On-demand check via GET /api/deadline-alerts/pending
 */
import prisma from '#src/config/database.ts';
import { sendScholarshipDeadlineAlert, ScholarshipAlertItem } from '#src/services/email.service.ts';

// Alert windows in days before the deadline
const ALERT_WINDOWS_DAYS = [30, 14, 7, 1];

export interface AlertRunResult {
  usersProcessed: number;
  alertsSent: number;
  alertsSkipped: number;
  errors: string[];
}

export interface PendingAlert {
  userId: string;
  email: string;
  userName: string;
  scholarshipId: string;
  scholarshipTitle: string;
  provider: string | null;
  deadlineId: string;
  deadline: Date;
  daysLeft: number;
  daysWindow: number;
  scholarshipUrl: string | null;
  amount: string | null;
}

// ── helpers ────────────────────────────────────────────────────────────────

function daysUntil(date: Date): number {
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── main service functions ─────────────────────────────────────────────────

/**
 * Find all pending alerts that have NOT yet been sent.
 * Returns one entry per (user × deadline × alert-window) tuple.
 */
export async function findPendingAlerts(): Promise<PendingAlert[]> {
  const now = new Date();

  // Look 30 days ahead (widest alert window)
  const cutoff = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Fetch upcoming scholarship deadlines
  const upcomingDeadlines = await prisma.scholarshipDeadline.findMany({
    where: {
      deadline: { gte: now, lte: cutoff },
      scholarship: { isActive: true },
    },
    include: {
      scholarship: { select: { id: true, title: true, provider: true, url: true, sourceUrl: true, amount: true } },
    },
    orderBy: { deadline: 'asc' },
  });

  if (upcomingDeadlines.length === 0) return [];

  // Fetch all users with email verified and a completed profile
  const users = await prisma.user.findMany({
    where: { emailVerified: true, isActive: true },
    select: { id: true, email: true, name: true },
  });

  const pending: PendingAlert[] = [];

  for (const user of users) {
    for (const dl of upcomingDeadlines) {
      const daysLeft = daysUntil(dl.deadline);

      for (const window of ALERT_WINDOWS_DAYS) {
        // Only trigger when we are within ±1 day of the window threshold
        if (daysLeft > window || daysLeft < window - 1) continue;

        // Check if alert already sent for this (user, deadline, window, channel)
        const alreadySent = await prisma.scholarshipAlertLog.findFirst({
          where: {
            userId: user.id,
            deadlineId: dl.id,
            daysBeforeSent: window,
            channel: 'email',
          },
        });

        if (!alreadySent) {
          pending.push({
            userId: user.id,
            email: user.email,
            userName: user.name,
            scholarshipId: dl.scholarship.id,
            scholarshipTitle: dl.scholarship.title,
            provider: dl.scholarship.provider,
            deadlineId: dl.id,
            deadline: dl.deadline,
            daysLeft,
            daysWindow: window,
            scholarshipUrl: dl.scholarship.sourceUrl ?? dl.scholarship.url,
            amount: dl.scholarship.amount,
          });
        }
      }
    }
  }

  return pending;
}

/**
 * Process all pending alerts: group by user, send email, log to DB.
 */
export async function runDeadlineAlertJob(): Promise<AlertRunResult> {
  const result: AlertRunResult = {
    usersProcessed: 0,
    alertsSent: 0,
    alertsSkipped: 0,
    errors: [],
  };

  const pending = await findPendingAlerts();
  if (pending.length === 0) return result;

  // Group pending alerts by user
  const byUser = new Map<string, PendingAlert[]>();
  for (const alert of pending) {
    const arr = byUser.get(alert.userId) ?? [];
    arr.push(alert);
    byUser.set(alert.userId, arr);
  }

  for (const [userId, alerts] of byUser) {
    result.usersProcessed++;

    const items: ScholarshipAlertItem[] = alerts.map((a) => ({
      scholarshipTitle: a.scholarshipTitle,
      provider: a.provider,
      deadlineDate: formatDate(a.deadline),
      daysLeft: a.daysLeft,
      scholarshipUrl: a.scholarshipUrl,
      amount: a.amount,
    }));

    try {
      await sendScholarshipDeadlineAlert(alerts[0].email, alerts[0].userName, items);

      // Log all sent alerts (deduplication guard)
      await prisma.scholarshipAlertLog.createMany({
        data: alerts.map((a) => ({
          userId,
          scholarshipId: a.scholarshipId,
          deadlineId: a.deadlineId,
          daysBeforeSent: a.daysWindow,
          channel: 'email',
        })),
        skipDuplicates: true,
      });

      result.alertsSent += alerts.length;
    } catch (err) {
      result.errors.push(`User ${userId}: ${(err as Error).message}`);
      result.alertsSkipped += alerts.length;
    }
  }

  return result;
}

/**
 * Count unread in-app alerts for a user in the last N days.
 * Used to populate the notification badge in the navbar.
 */
export async function getRecentAlertCount(userId: string, withinDays = 30): Promise<number> {
  const since = new Date(Date.now() - withinDays * 24 * 60 * 60 * 1000);
  return prisma.scholarshipAlertLog.count({
    where: { userId, sentAt: { gte: since } },
  });
}

/**
 * Get recent alert log for a user (for the in-app notification panel).
 */
export async function getRecentAlerts(userId: string, limit = 20) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const logs = await prisma.scholarshipAlertLog.findMany({
    where: { userId, sentAt: { gte: since } },
    orderBy: { sentAt: 'desc' },
    take: limit,
  });

  // Enrich with scholarship data
  const scholarshipIds = [...new Set(logs.map((l) => l.scholarshipId))];
  const scholarships = await prisma.scholarship.findMany({
    where: { id: { in: scholarshipIds } },
    select: { id: true, title: true, provider: true, url: true, sourceUrl: true },
  });
  const schMap = new Map(scholarships.map((s) => [s.id, s]));

  return logs.map((log) => {
    const s = schMap.get(log.scholarshipId);
    return {
      id: log.id,
      scholarshipId: log.scholarshipId,
      scholarshipTitle: s?.title ?? 'Unknown Scholarship',
      provider: s?.provider ?? null,
      scholarshipUrl: s?.sourceUrl ?? s?.url ?? null,
      daysBeforeSent: log.daysBeforeSent,
      sentAt: log.sentAt.toISOString(),
      channel: log.channel,
    };
  });
}
