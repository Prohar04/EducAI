import prisma from "#src/config/database.ts";
import type { JobSearchBody, JobSearchAIResponse } from "#src/schemas/jobSchemas.ts";
import { jobCache, suggestCache } from "#src/lib/jobCache.ts";
import logger from "#src/config/logger.ts";

const AI_SERVER_URL = process.env.AI_SERVER_URL ?? "http://localhost:8001";
const AI_SERVER_API_KEY = process.env.AI_SERVER_API_KEY ?? "";
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID ?? ""
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY ?? ""
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY ?? ""

function buildCacheKey(p: JobSearchBody): string {
  return [
    "jobs:v2",
    p.countryCode.toLowerCase(),
    p.city.trim().toLowerCase(),
    p.field.trim().toLowerCase(),
    p.jobType.toLowerCase(),
    String(p.page ?? 1),
  ].join(":");
}

async function callAIServer(payload: JobSearchBody): Promise<JobSearchAIResponse> {
  const response = await fetch(`${AI_SERVER_URL}/api/v1/jobs/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(AI_SERVER_API_KEY ? { "X-API-Key": AI_SERVER_API_KEY } : {}),
    },
    body: JSON.stringify({
      country: payload.country,
      country_code: payload.countryCode,
      city: payload.city,
      field: payload.field,
      job_type: payload.jobType,
      visa_type: payload.visaType,
      page: payload.page ?? 1,
    }),
    signal: AbortSignal.timeout(35_000),
  });

  if (!response.ok) {
    throw new Error(`AI server error: ${response.status}`);
  }

  return response.json() as Promise<JobSearchAIResponse>;
}

export async function searchJobsFromAI(userId: string, payload: JobSearchBody) {
  const cacheKey = buildCacheKey(payload);
  const cached = jobCache.get<JobSearchAIResponse & { searchId: string; cachedAt: string }>(cacheKey);

  if (cached) {
    logger.info(`[jobs] cache hit key=${cacheKey}`);
    // Upsert cachedAt timestamp in DB (fire-and-forget)
    prisma.jobSearch
      .findFirst({ where: { userId, countryCode: payload.countryCode, city: payload.city, field: payload.field, jobType: payload.jobType as "PART_TIME" | "FULL_TIME" | "INTERNSHIP" | "REMOTE" } })
      .then((existing) => {
        if (existing) {
          return prisma.jobSearch.update({ where: { id: existing.id }, data: { cachedAt: new Date() } });
        }
      })
      .catch(() => {});
    return { ...cached, fromCache: true };
  }

  logger.info(`[jobs] cache miss key=${cacheKey} — fetching from AI server`);
  const data = await callAIServer(payload);

  const jobType = payload.jobType as "PART_TIME" | "FULL_TIME" | "INTERNSHIP" | "REMOTE";
  const now = new Date();

  // Upsert the search record, replacing old results
  const existing = await prisma.jobSearch.findFirst({
    where: { userId, countryCode: payload.countryCode, city: payload.city, field: payload.field, jobType },
  });

  let searchId: string;
  if (existing) {
    await prisma.jobResult.deleteMany({ where: { jobSearchId: existing.id } });
    const updated = await prisma.jobSearch.update({
      where: { id: existing.id },
      data: {
        country: payload.country,
        visaType: payload.visaType ?? null,
        cachedAt: now,
        results: {
          create: data.listings.map((l) => ({
            title: l.title,
            company: l.company,
            companyLogo: l.company_logo ?? null,
            location: l.location,
            jobType: (l.job_type ?? jobType) as "PART_TIME" | "FULL_TIME" | "INTERNSHIP" | "REMOTE",
            salary: l.salary ?? null,
            salaryMin: l.salary_min ?? null,
            salaryMax: l.salary_max ?? null,
            currency: l.currency ?? null,
            postedAt: l.posted_at ?? null,
            visaSponsorship: l.visa_sponsorship ?? null,
            applyUrl: l.apply_url,
            description: l.description ?? null,
            source: l.source,
            isRemote: l.is_remote ?? false,
          })),
        },
      },
    });
    searchId = updated.id;
  } else {
    const created = await prisma.jobSearch.create({
      data: {
        userId,
        country: payload.country,
        countryCode: payload.countryCode,
        city: payload.city,
        jobType,
        field: payload.field,
        visaType: payload.visaType ?? null,
        cachedAt: now,
        results: {
          create: data.listings.map((l) => ({
            title: l.title,
            company: l.company,
            companyLogo: l.company_logo ?? null,
            location: l.location,
            jobType: (l.job_type ?? jobType) as "PART_TIME" | "FULL_TIME" | "INTERNSHIP" | "REMOTE",
            salary: l.salary ?? null,
            salaryMin: l.salary_min ?? null,
            salaryMax: l.salary_max ?? null,
            currency: l.currency ?? null,
            postedAt: l.posted_at ?? null,
            visaSponsorship: l.visa_sponsorship ?? null,
            applyUrl: l.apply_url,
            description: l.description ?? null,
            source: l.source,
            isRemote: l.is_remote ?? false,
          })),
        },
      },
    });
    searchId = created.id;
  }

  const result = { ...data, ai_fallback_used: data.ai_fallback_used ?? false, searchId, cachedAt: now.toISOString() };
  jobCache.set(cacheKey, result);
  return result;
}

export async function getSuggestions(type: string, query: string, context?: string) {
  if (type !== "jobtitle") return { suggestions: [] };

  const suggestCacheKey = `suggest:${type}:${query}:${context ?? ""}`;
  const cached = suggestCache.get<string[]>(suggestCacheKey);
  if (cached) return { suggestions: cached };

  const response = await fetch(`${AI_SERVER_URL}/api/v1/jobs/suggest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(AI_SERVER_API_KEY ? { "X-API-Key": AI_SERVER_API_KEY } : {}),
    },
    body: JSON.stringify({ type, query, context }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) return { suggestions: [] };

  const data = (await response.json()) as { suggestions: string[] };
  suggestCache.set(suggestCacheKey, data.suggestions);
  return { suggestions: data.suggestions };
}

export async function getJobSearchHistory(userId: string) {
  return prisma.jobSearch.findMany({
    where: { userId },
    include: { results: { take: 3 } },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });
}

export async function getRefreshStatus(userId: string) {
  const lastSearch = await prisma.jobSearch.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { cachedAt: true, updatedAt: true, country: true, city: true, field: true, jobType: true },
  });

  if (!lastSearch) return { hasSearch: false, needsRefresh: false };

  const ageMinutes = (Date.now() - lastSearch.updatedAt.getTime()) / 60_000;

  return {
    hasSearch: true,
    cachedAt: lastSearch.cachedAt?.toISOString() ?? null,
    lastUpdated: lastSearch.updatedAt.toISOString(),
    needsRefresh: ageMinutes > 55,
    lastSearch: {
      country: lastSearch.country,
      city: lastSearch.city,
      field: lastSearch.field,
      jobType: lastSearch.jobType,
    },
  };
}

export async function backgroundRefreshAll() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentSearches = await prisma.jobSearch.findMany({
    where: { updatedAt: { gte: cutoff } },
    distinct: ["countryCode", "city", "field", "jobType"],
    select: { country: true, countryCode: true, city: true, field: true, jobType: true, userId: true },
  });

  let refreshed = 0;
  const errors: string[] = [];

  for (const s of recentSearches) {
    try {
      const payload: JobSearchBody = {
        country: s.country,
        countryCode: s.countryCode,
        city: s.city,
        field: s.field,
        jobType: s.jobType,
        page: 1,
      };
      const cacheKey = buildCacheKey(payload);
      jobCache.del(cacheKey); // force fresh fetch
      await callAIServer(payload).then((data) => {
        jobCache.set(cacheKey, { ...data, cachedAt: new Date().toISOString() });
      });
      refreshed++;
    } catch (err) {
      errors.push(`${s.city}/${s.field}: ${err}`);
    }
  }

  return { refreshed, total: recentSearches.length, errors };
}
