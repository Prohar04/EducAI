/**
 * Data Sync Service — manages scheduled and manual data refresh pipelines.
 * Tracks every sync run in SyncJob for full history, health monitoring, and retry.
 *
 * Sources:
 *   scholarships — freshness check, expired deadline detection, counts
 *   programs     — triggers ai-server pipeline (Firecrawl → ingest)
 */

import prisma from '#src/config/database.ts';
import logger from '#src/config/logger.ts';

// ─── Public Types ────────────────────────────────────────────────────────────

export type SyncTarget = 'scholarships' | 'programs' | 'all';

export type SyncStatus =
  | 'running'
  | 'success'
  | 'partial_success'
  | 'failed'
  | 'cancelled';

export interface SourceResult {
  sourceKey: string;
  label: string;
  status: SyncStatus;
  recordsProcessed: number;
  recordsAdded: number;
  recordsUpdated: number;
  recordsSkipped: number;
  notes: string[];
  errors: string[];
  durationMs: number;
}

export interface SyncRunResult {
  jobId: string;
  target: SyncTarget;
  status: SyncStatus;
  triggerType: 'manual' | 'cron' | 'system';
  triggeredBy: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  recordsProcessed: number;
  recordsAdded: number;
  recordsUpdated: number;
  recordsSkipped: number;
  sources: SourceResult[];
  errorSummary: string | null;
}

export interface SyncSourceHealth {
  sourceKey: string;
  label: string;
  description: string;
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  lastStatus: SyncStatus | 'idle';
  isStale: boolean;
  staleSinceHours: number | null;
  recordCount: number;
  lastRunId: string | null;
}

export interface SyncStatusResponse {
  sources: SyncSourceHealth[];
  activeJob: { jobId: string; sourceKey: string; startedAt: string } | null;
  recentRuns: SyncRunResult[];
  totalRuns: number;
  successRate: number;
  nextScheduledRun: string;
  summary: {
    totalSources: number;
    healthySources: number;
    staleSources: number;
    failedLastRun: number;
    running: number;
  };
}

// ─── Source Definitions ──────────────────────────────────────────────────────

const SOURCES: Array<{ key: SyncTarget; label: string; description: string; staleHours: number }> = [
  {
    key: 'scholarships',
    label: 'Scholarships',
    description: 'Checks scholarship freshness, counts active records, flags expired deadlines',
    staleHours: 48,
  },
  {
    key: 'programs',
    label: 'University Programs',
    description: 'Triggers ai-server Firecrawl pipeline to discover and ingest new programs',
    staleHours: 24,
  },
];

// ─── Per-Source Sync Functions ───────────────────────────────────────────────

async function runScholarshipsSync(): Promise<SourceResult> {
  const start = Date.now();
  const result: SourceResult = {
    sourceKey: 'scholarships',
    label: 'Scholarships',
    status: 'success',
    recordsProcessed: 0,
    recordsAdded: 0,
    recordsUpdated: 0,
    recordsSkipped: 0,
    notes: [],
    errors: [],
    durationMs: 0,
  };

  try {
    const [total, active, withDeadlines, expiredDeadlines, recentlyUpdated] = await Promise.all([
      prisma.scholarship.count(),
      prisma.scholarship.count({ where: { isActive: true } }),
      prisma.scholarship.count({ where: { deadlines: { some: {} } } }),
      prisma.scholarshipDeadline.count({ where: { deadline: { lt: new Date() } } }),
      prisma.scholarship.count({
        where: { updatedAt: { gte: new Date(Date.now() - 7 * 86400_000) } },
      }),
    ]);

    if (total === 0) {
      result.errors.push('No scholarships in database — run `npm run seed:scholarships` to populate');
      result.status = 'failed';
    } else {
      result.recordsProcessed = total;
      result.recordsUpdated = recentlyUpdated;
      result.notes.push(`${total} total scholarships (${active} active)`);
      result.notes.push(`${withDeadlines} have deadline records; ${expiredDeadlines} deadlines are past`);
      if (recentlyUpdated > 0) {
        result.notes.push(`${recentlyUpdated} updated in the last 7 days`);
      }
      if (expiredDeadlines > 0) {
        result.notes.push(`⚠ ${expiredDeadlines} expired deadlines — consider refreshing scholarship data`);
      }
      result.status = 'success';
    }
  } catch (err) {
    result.errors.push(`Scholarship check failed: ${String(err)}`);
    result.status = 'failed';
  }

  result.durationMs = Date.now() - start;
  return result;
}

async function runProgramsSync(): Promise<SourceResult> {
  const start = Date.now();
  const result: SourceResult = {
    sourceKey: 'programs',
    label: 'University Programs',
    status: 'success',
    recordsProcessed: 0,
    recordsAdded: 0,
    recordsUpdated: 0,
    recordsSkipped: 0,
    notes: [],
    errors: [],
    durationMs: 0,
  };

  const aiServerUrl = process.env.AI_SERVER_URL ?? 'http://localhost:8000';
  const masterKey = process.env.MASTER_APIKEY;

  if (!masterKey) {
    result.errors.push('MASTER_APIKEY not configured — ai-server pipeline cannot be triggered');
    result.status = 'failed';
    result.durationMs = Date.now() - start;
    return result;
  }

  try {
    // Collect unique preferences across all user profiles for a comprehensive sync
    const profiles = await prisma.userProfile.findMany({
      select: { targetCountries: true, intendedMajor: true, intendedLevel: true },
      take: 50,
    });

    const countries = [...new Set(
      profiles.flatMap(p => (p.targetCountries as string[] | null) ?? [])
        .filter(Boolean),
    )];
    const fields = [...new Set(profiles.map(p => p.intendedMajor).filter(Boolean) as string[])];
    const levels = [...new Set(profiles.map(p => p.intendedLevel).filter(Boolean) as string[])];

    const syncPayload = {
      targetCountries: countries.length > 0 ? countries.slice(0, 5) : ['US', 'UK', 'CA'],
      fields: fields.length > 0 ? fields.slice(0, 3) : ['Computer Science'],
      levels: levels.length > 0 ? levels.slice(0, 3) : ['MSC'],
      triggeredBy: 'sync',
    };

    result.notes.push(
      `Triggering pipeline for ${syncPayload.targetCountries.join(', ')} · ${syncPayload.fields.join(', ')} · ${syncPayload.levels.join(', ')}`,
    );

    const response = await fetch(`${aiServerUrl}/api/v1/module1/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': masterKey,
      },
      body: JSON.stringify(syncPayload),
      signal: AbortSignal.timeout(30_000),
    });

    if (response.status === 202) {
      // ai-server accepted the job — pipeline runs in background, data arrives via /internal/module1/ingest
      const body = await response.json() as { task_id?: string };
      result.notes.push(
        `Pipeline queued (task_id: ${body.task_id ?? 'unknown'}) — data will arrive via ingest callback`,
      );
      result.status = 'success';
      result.recordsProcessed = 1; // 1 pipeline triggered
    } else if (response.ok) {
      const body = await response.json() as { created?: number; updated?: number };
      result.recordsAdded = body.created ?? 0;
      result.recordsUpdated = body.updated ?? 0;
      result.recordsProcessed = result.recordsAdded + result.recordsUpdated;
      result.status = 'success';
    } else {
      const text = await response.text().catch(() => '');
      result.errors.push(`ai-server returned HTTP ${response.status}: ${text.slice(0, 200)}`);
      result.status = 'failed';
    }

    // Snapshot current program count for context
    const programCount = await prisma.program.count();
    result.notes.push(`${programCount} programs currently in database`);

  } catch (err) {
    const msg = String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('fetch failed') || msg.includes('ENOTFOUND')) {
      result.errors.push('ai-server is not reachable — ensure it is running and AI_SERVER_URL is correct');
    } else if (msg.includes('TimeoutError') || msg.includes('AbortError')) {
      result.errors.push('ai-server request timed out after 30s — it may still be running in the background');
    } else {
      result.errors.push(`Program pipeline error: ${msg}`);
    }
    result.status = 'failed';
  }

  result.durationMs = Date.now() - start;
  return result;
}

// ─── Concurrent Run Guard ────────────────────────────────────────────────────

async function getActiveJob(sourceKey: string): Promise<{ id: string; startedAt: Date } | null> {
  return prisma.syncJob.findFirst({
    where: {
      status: 'running',
      // stale guard: running for more than 10 minutes → treat as stale, allow new run
      startedAt: { gte: new Date(Date.now() - 10 * 60_000) },
      ...(sourceKey !== 'all' ? { sourceKey: { in: [sourceKey, 'all'] } } : {}),
    },
    select: { id: true, startedAt: true },
  });
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

export async function runDataSync(
  target: SyncTarget = 'all',
  triggerType: 'cron' | 'manual' | 'system' = 'manual',
  triggeredBy = 'unknown',
): Promise<SyncRunResult> {
  // Deduplication: reject if already running
  const active = await getActiveJob(target);
  if (active) {
    const waitingSecs = Math.round((Date.now() - active.startedAt.getTime()) / 1000);
    const result: SyncRunResult = {
      jobId: active.id,
      target,
      status: 'running',
      triggerType,
      triggeredBy,
      startedAt: active.startedAt.toISOString(),
      finishedAt: '',
      durationMs: 0,
      recordsProcessed: 0,
      recordsAdded: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      sources: [],
      errorSummary: `A ${target} sync is already running (started ${waitingSecs}s ago). Please wait.`,
    };
    return result;
  }

  const startedAt = new Date();

  // Create job record
  const job = await prisma.syncJob.create({
    data: {
      sourceKey: target,
      status: 'running',
      triggerType,
      triggeredBy,
      startedAt,
    },
  });

  logger.info(`[dataSync] job=${job.id} target=${target} triggerType=${triggerType} triggeredBy=${triggeredBy}`);

  const sourceResults: SourceResult[] = [];

  try {
    if (target === 'scholarships' || target === 'all') {
      const r = await runScholarshipsSync();
      sourceResults.push(r);
      logger.info(`[dataSync] scholarships status=${r.status} processed=${r.recordsProcessed} errors=${r.errors.length}`);
    }

    if (target === 'programs' || target === 'all') {
      const r = await runProgramsSync();
      sourceResults.push(r);
      logger.info(`[dataSync] programs status=${r.status} processed=${r.recordsProcessed} errors=${r.errors.length}`);
    }
  } catch (unexpectedErr) {
    logger.error(`[dataSync] unexpected error in job=${job.id}: ${unexpectedErr}`);
    sourceResults.push({
      sourceKey: target,
      label: target,
      status: 'failed',
      recordsProcessed: 0,
      recordsAdded: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      notes: [],
      errors: [`Unexpected error: ${String(unexpectedErr)}`],
      durationMs: 0,
    });
  }

  const finishedAt = new Date();
  const durationMs = finishedAt.getTime() - startedAt.getTime();

  const totalProcessed = sourceResults.reduce((s, r) => s + r.recordsProcessed, 0);
  const totalAdded = sourceResults.reduce((s, r) => s + r.recordsAdded, 0);
  const totalUpdated = sourceResults.reduce((s, r) => s + r.recordsUpdated, 0);
  const totalSkipped = sourceResults.reduce((s, r) => s + r.recordsSkipped, 0);
  const allErrors = sourceResults.flatMap(r => r.errors);
  const anySuccess = sourceResults.some(r => r.status === 'success' || r.status === 'partial_success');

  const finalStatus: SyncStatus =
    allErrors.length === 0 ? 'success'
      : anySuccess ? 'partial_success'
        : 'failed';

  const errorSummary = allErrors.length > 0 ? allErrors.join(' | ') : null;

  // Persist final state
  await prisma.syncJob.update({
    where: { id: job.id },
    data: {
      status: finalStatus,
      finishedAt,
      durationMs,
      recordsProcessed: totalProcessed,
      recordsAdded: totalAdded,
      recordsUpdated: totalUpdated,
      recordsSkipped: totalSkipped,
      errorMessage: errorSummary,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      summary: sourceResults as any,
    },
  });

  logger.info(`[dataSync] job=${job.id} done status=${finalStatus} durationMs=${durationMs}`);

  return {
    jobId: job.id,
    target,
    status: finalStatus,
    triggerType,
    triggeredBy,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs,
    recordsProcessed: totalProcessed,
    recordsAdded: totalAdded,
    recordsUpdated: totalUpdated,
    recordsSkipped: totalSkipped,
    sources: sourceResults,
    errorSummary,
  };
}

// ─── Status & History ────────────────────────────────────────────────────────

export async function getSyncHistory(limit = 20): Promise<SyncRunResult[]> {
  const jobs = await prisma.syncJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return jobs.map(j => ({
    jobId: j.id,
    target: j.sourceKey as SyncTarget,
    status: j.status as SyncStatus,
    triggerType: j.triggerType as SyncRunResult['triggerType'],
    triggeredBy: j.triggeredBy ?? 'unknown',
    startedAt: j.startedAt.toISOString(),
    finishedAt: j.finishedAt?.toISOString() ?? '',
    durationMs: j.durationMs ?? 0,
    recordsProcessed: j.recordsProcessed,
    recordsAdded: j.recordsAdded,
    recordsUpdated: j.recordsUpdated,
    recordsSkipped: j.recordsSkipped,
    sources: (j.summary as SourceResult[] | null) ?? [],
    errorSummary: j.errorMessage ?? null,
  }));
}

export async function getSyncStatus(): Promise<SyncStatusResponse> {
  try {
    const [scholarshipCount, programCount, totalRuns, recentJobs, activeJobRow] = await Promise.all([
      prisma.scholarship.count(),
      prisma.program.count(),
      prisma.syncJob.count(),
      prisma.syncJob.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.syncJob.findFirst({
        where: { status: 'running', startedAt: { gte: new Date(Date.now() - 10 * 60_000) } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Next scheduled run — daily 06:00 UTC
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setUTCHours(6, 0, 0, 0);
    if (nextRun <= now) nextRun.setUTCDate(nextRun.getUTCDate() + 1);

    // Per-source health
    const sourceHealthList: SyncSourceHealth[] = await Promise.all(
      SOURCES.map(async src => {
        const lastJob = await prisma.syncJob.findFirst({
          where: { sourceKey: { in: [src.key, 'all'] } },
          orderBy: { createdAt: 'desc' },
        });
        const lastSuccess = await prisma.syncJob.findFirst({
          where: { sourceKey: { in: [src.key, 'all'] }, status: { in: ['success', 'partial_success'] } },
          orderBy: { finishedAt: 'desc' },
        });

        const recordCount = src.key === 'scholarships' ? scholarshipCount : programCount;
        const staleCutoff = new Date(Date.now() - src.staleHours * 3_600_000);
        const lastSuccessAt = lastSuccess?.finishedAt ?? null;
        const isStale = !lastSuccessAt || lastSuccessAt < staleCutoff;
        const staleSinceHours = lastSuccessAt
          ? Math.round((Date.now() - lastSuccessAt.getTime()) / 3_600_000)
          : null;

        return {
          sourceKey: src.key,
          label: src.label,
          description: src.description,
          lastRunAt: lastJob?.startedAt.toISOString() ?? null,
          lastSuccessAt: lastSuccessAt?.toISOString() ?? null,
          lastStatus: (lastJob?.status ?? 'idle') as SyncSourceHealth['lastStatus'],
          isStale,
          staleSinceHours,
          recordCount,
          lastRunId: lastJob?.id ?? null,
        };
      }),
    );

    // Success rate from last 20 runs
    const last20 = recentJobs.slice(0, 20);
    const succeeded = last20.filter(j => j.status === 'success' || j.status === 'partial_success').length;
    const successRate = last20.length > 0 ? Math.round((succeeded / last20.length) * 100) : 100;

    const recentRuns: SyncRunResult[] = recentJobs.map(j => ({
      jobId: j.id,
      target: j.sourceKey as SyncTarget,
      status: j.status as SyncStatus,
      triggerType: j.triggerType as SyncRunResult['triggerType'],
      triggeredBy: j.triggeredBy ?? 'unknown',
      startedAt: j.startedAt.toISOString(),
      finishedAt: j.finishedAt?.toISOString() ?? '',
      durationMs: j.durationMs ?? 0,
      recordsProcessed: j.recordsProcessed,
      recordsAdded: j.recordsAdded,
      recordsUpdated: j.recordsUpdated,
      recordsSkipped: j.recordsSkipped,
      sources: (j.summary as SourceResult[] | null) ?? [],
      errorSummary: j.errorMessage ?? null,
    }));

    return {
      sources: sourceHealthList,
      activeJob: activeJobRow
        ? { jobId: activeJobRow.id, sourceKey: activeJobRow.sourceKey, startedAt: activeJobRow.startedAt.toISOString() }
        : null,
      recentRuns,
      totalRuns,
      successRate,
      nextScheduledRun: nextRun.toISOString(),
      summary: {
        totalSources: SOURCES.length,
        healthySources: sourceHealthList.filter(s => !s.isStale && s.lastStatus !== 'failed').length,
        staleSources: sourceHealthList.filter(s => s.isStale).length,
        failedLastRun: sourceHealthList.filter(s => s.lastStatus === 'failed').length,
        running: activeJobRow ? 1 : 0,
      },
    };
  } catch (err) {
    logger.error(`[dataSync] getSyncStatus failed: ${err}`);
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setUTCHours(6, 0, 0, 0);
    if (nextRun <= now) nextRun.setUTCDate(nextRun.getUTCDate() + 1);
    return {
      sources: [],
      activeJob: null,
      recentRuns: [],
      totalRuns: 0,
      successRate: 0,
      nextScheduledRun: nextRun.toISOString(),
      summary: { totalSources: 0, healthySources: 0, staleSources: 0, failedLastRun: 0, running: 0 },
    };
  }
}
