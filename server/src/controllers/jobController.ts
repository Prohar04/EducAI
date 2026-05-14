import type { Response, NextFunction } from "express";
import type { AuthRequest } from "#src/types/authRequest.type.ts";
import {
  searchJobsFromAI,
  getSuggestions,
  getJobSearchHistory,
  getRefreshStatus,
  backgroundRefreshAll,
} from "#src/services/jobService.ts";
import { jobSearchSchema, suggestQuerySchema } from "#src/schemas/jobSchemas.ts";
import logger from "#src/config/logger.ts";

export async function searchJobs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const userId = req.userId!;
  const parsed = jobSearchSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  try {
    logger.info(`[jobs] search userId=${userId} country=${parsed.data.body.country} type=${parsed.data.body.jobType}`);
    const result = await searchJobsFromAI(userId, parsed.data.body);
    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    logger.error(`[jobs] search failed userId=${userId}: ${err}`);
    next(err);
  }
}

export async function getJobSuggestions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const parsed = suggestQuerySchema.safeParse({ query: req.query });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query", details: parsed.error.flatten() });
    return;
  }

  const { type, query, context } = parsed.data.query;
  try {
    const result = await getSuggestions(type, query, context);
    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    logger.error(`[jobs] suggest failed: ${err}`);
    next(err);
  }
}

export async function getJobHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const userId = req.userId!;
  try {
    const history = await getJobSearchHistory(userId);
    res.status(200).json({ ok: true, data: history });
  } catch (err) {
    logger.error(`[jobs] history failed userId=${userId}: ${err}`);
    next(err);
  }
}

export async function getJobRefreshStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const userId = req.userId!;
  try {
    const status = await getRefreshStatus(userId);
    res.status(200).json({ ok: true, data: status });
  } catch (err) {
    next(err);
  }
}

export async function triggerBackgroundRefresh(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.info("[jobs] background refresh triggered");
    const result = await backgroundRefreshAll();
    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    logger.error(`[jobs] background refresh failed: ${err}`);
    next(err);
  }
}
