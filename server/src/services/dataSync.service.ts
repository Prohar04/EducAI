/**
 * Data Sync Service — manages scheduled and manual data refresh pipelines.
 *
 * Every run is persisted in SyncJob with:
 *   - full per-source SourceResult breakdown
 *   - structured rawLogs (timestamped lines)
 *   - crawlerDetails for programs pipeline
 *   - stackTrace for unexpected errors
 *   - queueState transitions
 *
 * Sources:
 *   scholarships — database freshness check, counts, expired deadline detection
 *   programs     — triggers ai-server Firecrawl pipeline → ingest callback
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
// details about the program crawling pipeline
export interface CrawlerDetails {
  taskId?: string;
  preferences?: {
    countries: string[];
    fields: string[];
    levels: string[];
  };
  programCountBefore?: number;
  programCountAfter?: number;
  pipelineStatus?: string;
  aiServerUrl?: string;
}

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
  crawlerDetails?: CrawlerDetails;
  rawLogs?: string[];
}

export interface SyncRunResult {
  jobId: string;
  target: SyncTarget;
  status: SyncStatus;
  queueState: string;
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
  rawLogs: string[];
  crawlerDetails: CrawlerDetails | null;
  stackTrace: string | null;
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
  activeJob: { jobId: string; sourceKey: string; startedAt: string; queueState: string } | null;
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
    totalRecordsManaged: number;
  };
}

// ─── Source Definitions ──────────────────────────────────────────────────────

const SOURCES: Array<{
  key: SyncTarget;
  label: string;
  description: string;
  staleHours: number;
  category: string;
}> = [
  {
    key: 'scholarships',
    label: 'Scholarships',
    description: 'Checks scholarship freshness, counts active records, flags expired deadlines',
    staleHours: 48,
    category: 'Funding',
  },
  {
    key: 'programs',
    label: 'University Programs',
    description: 'Triggers ai-server Firecrawl pipeline to discover and ingest new programs',
    staleHours: 24,
    category: 'Academic',
  },
];

// ─── Log Helpers ─────────────────────────────────────────────────────────────

function makeLogger(lines: string[]) {
  return {
    info: (msg: string) => {
      const line = `[${new Date().toISOString()}] [INFO]  ${msg}`;
      lines.push(line);
      logger.info(msg);
    },
    warn: (msg: string) => {
      const line = `[${new Date().toISOString()}] [WARN]  ${msg}`;
      lines.push(line);
      logger.warn(msg);
    },
    error: (msg: string) => {
      const line = `[${new Date().toISOString()}] [ERROR] ${msg}`;
      lines.push(line);
      logger.error(msg);
    },
  };
}

// Checks existing scholarship records in the database.
// This does not scrape new scholarship websites; it verifies freshness, active status, and expired deadlines.

async function runScholarshipsSync(log: ReturnType<typeof makeLogger>): Promise<SourceResult> {
  const start = Date.now();
  const rawLogs: string[] = [];
  const srcLog = makeLogger(rawLogs);

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
    rawLogs,
  };

  try {
    srcLog.info('Starting scholarship freshness check');
    log.info('[scholarships] starting freshness check');

    const [total, active, withDeadlines, expiredDeadlines, recentlyUpdated] = await Promise.all([
      prisma.scholarship.count(),
      prisma.scholarship.count({ where: { isActive: true } }),
      prisma.scholarship.count({ where: { deadlines: { some: {} } } }),
      prisma.scholarshipDeadline.count({ where: { deadline: { lt: new Date() } } }),
      prisma.scholarship.count({
        where: { updatedAt: { gte: new Date(Date.now() - 7 * 86400_000) } },
      }),
    ]);

    srcLog.info(`Database query complete — total=${total} active=${active} withDeadlines=${withDeadlines}`);
    srcLog.info(`Expired deadlines=${expiredDeadlines} updatedLast7d=${recentlyUpdated}`);
    log.info(`[scholarships] total=${total} active=${active} expired=${expiredDeadlines}`);

    if (total === 0) {
      srcLog.error('No scholarships found in database');
      srcLog.warn('Populate via: npm run seed:scholarships');
      result.errors.push('No scholarships in database — run `npm run seed:scholarships` to populate');
      result.status = 'failed';
    } else {
      result.recordsProcessed = total;
      result.recordsUpdated = recentlyUpdated;

      result.notes.push(`${total} total scholarships (${active} active)`);
      result.notes.push(`${withDeadlines} have deadline records; ${expiredDeadlines} deadlines are past`);

      srcLog.info(`${total} total scholarships, ${active} active, ${withDeadlines} with deadlines`);

      if (recentlyUpdated > 0) {
        const note = `${recentlyUpdated} updated in the last 7 days`;
        result.notes.push(note);
        srcLog.info(note);
      }
      if (expiredDeadlines > 0) {
        const note = `⚠ ${expiredDeadlines} expired deadlines — consider refreshing scholarship data`;
        result.notes.push(note);
        srcLog.warn(`${expiredDeadlines} expired deadlines detected`);
      }

      result.status = 'success';
      srcLog.info('Scholarship check complete — status=success');
    }
  } catch (err) {
    const msg = `Scholarship check failed: ${String(err)}`;
    result.errors.push(msg);
    result.status = 'failed';
    srcLog.error(msg);
    log.error(`[scholarships] ${msg}`);
  }

  result.durationMs = Date.now() - start;
  srcLog.info(`Finished in ${result.durationMs}ms`);
  return result;
}
// Triggers the AI-server program discovery pipeline.
// The backend sends user preference data to the AI server, which searches and scrapes program information.
async function runProgramsSync(log: ReturnType<typeof makeLogger>): Promise<SourceResult> {
  const start = Date.now();
  const rawLogs: string[] = [];
  const srcLog = makeLogger(rawLogs);

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
    rawLogs,
    crawlerDetails: {},
  };

  const aiServerUrl = process.env.AI_SERVER_URL ?? 'http://localhost:8000'; //where the AI server is running
  const masterKey = process.env.MASTER_APIKEY; //secret key needed to call AI server

  srcLog.info(`Starting programs pipeline sync — aiServerUrl=${aiServerUrl}`);
  log.info(`[programs] starting pipeline sync target=${aiServerUrl}`);
 // without masterkey, ai will not run
  if (!masterKey) {
    const msg = 'MASTER_APIKEY not configured — ai-server pipeline cannot be triggered';
    result.errors.push(msg);
    result.status = 'failed';
    result.durationMs = Date.now() - start;
    srcLog.error(msg);
    log.error('[programs] ' + msg);
    result.crawlerDetails = { aiServerUrl, pipelineStatus: 'not_configured' };
    return result;
  }

  try {
    srcLog.info('Collecting user preferences from profiles (max 50)');
    const profiles = await prisma.userProfile.findMany({
      select: { targetCountries: true, intendedMajor: true, intendedLevel: true },
      take: 50,
    });

    const countries = [...new Set(
      profiles.flatMap(p => (p.targetCountries as string[] | null) ?? []).filter(Boolean),
    )];
    const fields = [...new Set(profiles.map(p => p.intendedMajor).filter(Boolean) as string[])];
    const levels = [...new Set(profiles.map(p => p.intendedLevel).filter(Boolean) as string[])];

    const preferences = {
      countries: countries.length > 0 ? countries.slice(0, 5) : ['US', 'UK', 'CA'],
      fields: fields.length > 0 ? fields.slice(0, 3) : ['Computer Science'],
      levels: levels.length > 0 ? levels.slice(0, 3) : ['MSC'],
    };

    srcLog.info(`Aggregated preferences — countries=[${preferences.countries.join(',')}] fields=[${preferences.fields.join(',')}] levels=[${preferences.levels.join(',')}]`);
    srcLog.info(`User profiles sampled: ${profiles.length}`);
    log.info(`[programs] preferences=${JSON.stringify(preferences)}`);

    const syncPayload = { ...preferences, triggeredBy: 'sync' };

    result.notes.push(
      `Triggering pipeline for ${preferences.countries.join(', ')} · ${preferences.fields.join(', ')} · ${preferences.levels.join(', ')}`,
    );

    const programCountBefore = await prisma.program.count();
    srcLog.info(`Programs in database before sync: ${programCountBefore}`);

    result.crawlerDetails = {
      aiServerUrl,
      preferences,
      programCountBefore,
      pipelineStatus: 'triggering',
    };

    srcLog.info(`POST ${aiServerUrl}/api/v1/module1/sync`);
    log.info(`[programs] triggering ai-server pipeline`);

    const response = await fetch(`${aiServerUrl}/api/v1/module1/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': masterKey,
      },
      body: JSON.stringify(syncPayload),
      signal: AbortSignal.timeout(30_000),
    });

    srcLog.info(`ai-server response: HTTP ${response.status}`);
    log.info(`[programs] ai-server HTTP ${response.status}`);

    if (response.status === 202) {
      const body = await response.json() as { task_id?: string };
      const taskId = body.task_id ?? 'unknown';
      result.crawlerDetails.taskId = taskId;
      result.crawlerDetails.pipelineStatus = 'queued';
      result.notes.push(`Pipeline queued (task_id: ${taskId}) — data will arrive via ingest callback`);
      result.status = 'success';
      result.recordsProcessed = 1;
      srcLog.info(`Pipeline accepted — task_id=${taskId} status=queued`);
      srcLog.info('Data will arrive asynchronously via /internal/module1/ingest');
      log.info(`[programs] pipeline queued task_id=${taskId}`);
    } else if (response.ok) {
      const body = await response.json() as { created?: number; updated?: number };
      result.recordsAdded = body.created ?? 0;
      result.recordsUpdated = body.updated ?? 0;
      result.recordsProcessed = result.recordsAdded + result.recordsUpdated;
      result.crawlerDetails.pipelineStatus = 'completed_sync';
      result.status = 'success';
      srcLog.info(`Pipeline returned sync — created=${result.recordsAdded} updated=${result.recordsUpdated}`);
    } else {
      const text = await response.text().catch(() => '');
      const msg = `ai-server returned HTTP ${response.status}: ${text.slice(0, 300)}`;
      result.errors.push(msg);
      result.status = 'failed';
      result.crawlerDetails.pipelineStatus = 'http_error';
      srcLog.error(msg);
      log.error(`[programs] ${msg}`);
    }

    const programCountAfter = await prisma.program.count();
    result.crawlerDetails.programCountAfter = programCountAfter;
    result.notes.push(`${programCountAfter} programs currently in database`);
    srcLog.info(`Programs in database after sync: ${programCountAfter}`);

  } catch (err) {
    const msg = String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('fetch failed') || msg.includes('ENOTFOUND')) {
      const errMsg = 'ai-server is not reachable — ensure it is running and AI_SERVER_URL is correct';
      result.errors.push(errMsg);
      srcLog.error(`Connection refused to ${aiServerUrl}`);
      srcLog.error(errMsg);
    } else if (msg.includes('TimeoutError') || msg.includes('AbortError')) {
      const errMsg = 'ai-server request timed out after 30s — pipeline may still be running in background';
      result.errors.push(errMsg);
      srcLog.warn(`Request timed out after 30s`);
      srcLog.warn(errMsg);
    } else {
      const errMsg = `Program pipeline error: ${msg}`;
      result.errors.push(errMsg);
      srcLog.error(errMsg);
    }
    result.status = 'failed';
    if (result.crawlerDetails) result.crawlerDetails.pipelineStatus = 'error';
    log.error(`[programs] error: ${msg}`);
  }

  result.durationMs = Date.now() - start;
  srcLog.info(`Finished in ${result.durationMs}ms status=${result.status}`);
  return result;
}

// ─── Concurrent Run Guard ────────────────────────────────────────────────────

async function getActiveJob(sourceKey: string): Promise<{ id: string; startedAt: Date } | null> {
  return prisma.syncJob.findFirst({
    where: {
      status: 'running',
      startedAt: { gte: new Date(Date.now() - 10 * 60_000) },
      ...(sourceKey !== 'all' ? { sourceKey: { in: [sourceKey, 'all'] } } : {}),
    },
    select: { id: true, startedAt: true },
  });
}

// ─── Job Row → SyncRunResult ─────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jobToRunResult(j: any): SyncRunResult {
  const rawLogText: string = j.rawLogs ?? '';
  return {
    jobId: j.id,
    target: j.sourceKey as SyncTarget,
    status: j.status as SyncStatus,
    queueState: j.queueState ?? 'done',
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
    rawLogs: rawLogText ? rawLogText.split('\n').filter(Boolean) : [],
    crawlerDetails: (j.crawlerDetails as CrawlerDetails | null) ?? null,
    stackTrace: j.stackTrace ?? null,
  };
}

// Main data sync entry point.
// It decides whether to refresh scholarship data, university program data, or both.

export async function runDataSync(
  target: SyncTarget = 'all',
  triggerType: 'cron' | 'manual' | 'system' = 'manual',
  triggeredBy = 'unknown',
): Promise<SyncRunResult> {
  const active = await getActiveJob(target);
  if (active) {
    const waitingSecs = Math.round((Date.now() - active.startedAt.getTime()) / 1000);
    return {
      jobId: active.id,
      target,
      status: 'running',
      queueState: 'running',
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
      rawLogs: [],
      crawlerDetails: null,
      stackTrace: null,
    };
  }

  const startedAt = new Date();
  const globalLogs: string[] = [];
  const log = makeLogger(globalLogs);

  // Create job record with queueState=queued
  const job = await prisma.syncJob.create({
    data: {
      sourceKey: target,
      status: 'running',
      queueState: 'queued',
      triggerType,
      triggeredBy,
      startedAt,
    },
  });

  // Mark as running
  await prisma.syncJob.update({ where: { id: job.id }, data: { queueState: 'running' } });

  log.info(`Job created — id=${job.id} target=${target} trigger=${triggerType} by=${triggeredBy}`);
  logger.info(`[dataSync] job=${job.id} target=${target} triggerType=${triggerType} triggeredBy=${triggeredBy}`);

  const sourceResults: SourceResult[] = [];
  let stackTrace: string | null = null;
  let crawlerDetails: CrawlerDetails | null = null;

  try {
    if (target === 'scholarships' || target === 'all') {
      log.info(`Starting source: scholarships`);
      const r = await runScholarshipsSync(log);
      sourceResults.push(r);
      log.info(`Source scholarships done — status=${r.status} processed=${r.recordsProcessed} errors=${r.errors.length}`);
      logger.info(`[dataSync] scholarships status=${r.status} processed=${r.recordsProcessed}`);
    }

    if (target === 'programs' || target === 'all') {
      log.info(`Starting source: programs`);
      const r = await runProgramsSync(log);
      sourceResults.push(r);
      if (r.crawlerDetails) crawlerDetails = r.crawlerDetails;
      log.info(`Source programs done — status=${r.status} processed=${r.recordsProcessed} errors=${r.errors.length}`);
      logger.info(`[dataSync] programs status=${r.status} processed=${r.recordsProcessed}`);
    }
  } catch (unexpectedErr) {
    const errStr = String(unexpectedErr);
    stackTrace = unexpectedErr instanceof Error ? (unexpectedErr.stack ?? errStr) : errStr;
    log.error(`Unexpected error in job=${job.id}: ${errStr}`);
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
      errors: [`Unexpected error: ${errStr}`],
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

  log.info(`Job complete — status=${finalStatus} duration=${durationMs}ms records=${totalProcessed}`);
  if (errorSummary) log.error(`Error summary: ${errorSummary}`);

  // Strip rawLogs from source results before persisting in summary (stored in rawLogs column)
  const summaryForPersist = sourceResults.map(r => {
    const { rawLogs: _, ...rest } = r;
    return rest;
  });

  // Combine all raw logs: global job log + per-source logs
  const allRawLogs: string[] = [...globalLogs];
  for (const r of sourceResults) {
    if (r.rawLogs && r.rawLogs.length > 0) {
      allRawLogs.push(`--- Source: ${r.label} ---`);
      allRawLogs.push(...r.rawLogs);
    }
  }

  await prisma.syncJob.update({
    where: { id: job.id },
    data: {
      status: finalStatus,
      queueState: 'done',
      finishedAt,
      durationMs,
      recordsProcessed: totalProcessed,
      recordsAdded: totalAdded,
      recordsUpdated: totalUpdated,
      recordsSkipped: totalSkipped,
      errorMessage: errorSummary,
      summary: summaryForPersist as object[],
      rawLogs: allRawLogs.join('\n'),
      crawlerDetails: crawlerDetails !== null ? (crawlerDetails as object) : undefined,
      stackTrace,
    },
  });

  logger.info(`[dataSync] job=${job.id} done status=${finalStatus} durationMs=${durationMs}`);

  return {
    jobId: job.id,
    target,
    status: finalStatus,
    queueState: 'done',
    triggerType,
    triggeredBy,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs,
    recordsProcessed: totalProcessed,
    recordsAdded: totalAdded,
    recordsUpdated: totalUpdated,
    recordsSkipped: totalSkipped,
    sources: sourceResults.map(r => ({ ...r, rawLogs: r.rawLogs ?? [] })),
    errorSummary,
    rawLogs: allRawLogs,
    crawlerDetails,
    stackTrace,
  };
}

// ─── History & Status ────────────────────────────────────────────────────────

export async function getSyncHistory(limit = 20): Promise<SyncRunResult[]> {
  const jobs = await prisma.syncJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return jobs.map(jobToRunResult);
}

export async function getJobDetails(id: string): Promise<SyncRunResult | null> {
  const job = await prisma.syncJob.findUnique({ where: { id } });
  if (!job) return null;
  return jobToRunResult(job);
}

export async function cancelJob(id: string): Promise<{ ok: boolean; message: string }> {
  const job = await prisma.syncJob.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!job) return { ok: false, message: 'Job not found' };
  if (job.status !== 'running') return { ok: false, message: `Job is ${job.status}, cannot cancel` };
  await prisma.syncJob.update({
    where: { id },
    data: { status: 'cancelled', queueState: 'done', finishedAt: new Date() },
  });
  logger.info(`[dataSync] job=${id} manually cancelled`);
  return { ok: true, message: 'Job marked as cancelled' };
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

    const last20 = recentJobs.slice(0, 20);
    const succeeded = last20.filter(j => j.status === 'success' || j.status === 'partial_success').length;
    const successRate = last20.length > 0 ? Math.round((succeeded / last20.length) * 100) : 100;

    const recentRuns: SyncRunResult[] = recentJobs.map(jobToRunResult);

    return {
      sources: sourceHealthList,
      activeJob: activeJobRow
        ? {
          jobId: activeJobRow.id,
          sourceKey: activeJobRow.sourceKey,
          startedAt: activeJobRow.startedAt.toISOString(),
          queueState: (activeJobRow as { queueState?: string | null }).queueState ?? 'running',
        }
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
        totalRecordsManaged: scholarshipCount + programCount,
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
      summary: { totalSources: 0, healthySources: 0, staleSources: 0, failedLastRun: 0, running: 0, totalRecordsManaged: 0 },
    };
  }
}
