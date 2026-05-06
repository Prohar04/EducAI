/**
 * Live Scholarship Refresh Service
 *
 * Uses Serper (web search) + OpenAI / OpenRouter (LLM extraction) to discover
 * and upsert new scholarships into the database.
 *
 * Gracefully degrades if API keys are absent — never throws.
 */

import prisma from '#src/config/database.ts';
import logger from '#src/config/logger.ts';

// ─── Public Types ─────────────────────────────────────────────────────────────

export interface LiveRefreshResult {
  discovered: number;
  upserted: number;
  skipped: number;
  errors: string[];
  sourcesUsed: string[];
  durationMs: number;
}

export interface LiveRefreshOptions {
  countryCodes?: string[];
  levels?: string[];
  fields?: string[];
  force?: boolean;
}

// ─── Internal Types ───────────────────────────────────────────────────────────

interface SerperResult {
  title: string;
  snippet: string;
  link: string;
}

interface ExtractedScholarship {
  title: string;
  provider: string | null;
  countryCode: string | null;
  level: 'BSC' | 'MSC' | 'PHD' | null;
  field: string | null;
  amount: string | null;
  fundingType: 'full' | 'partial' | 'living' | 'research' | null;
  deadline: string | null;
  url: string | null;
  description: string | null;
  confidence: 'high' | 'medium' | 'low';
}

// ─── Configuration Check ──────────────────────────────────────────────────────

export function isLiveRefreshAvailable(): boolean {
  return !!process.env.SERPER_API_KEY;
}

function getOpenAIConfig(): { apiKey: string; baseUrl: string; model: string } | null {
  if (process.env.OPENAI_API_KEY) {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
    };
  }
  if (process.env.OPENROUTER_API_KEY) {
    return {
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'openai/gpt-4o-mini',
    };
  }
  return null;
}

// ─── Query Builder ────────────────────────────────────────────────────────────

function buildSearchQueries(options: LiveRefreshOptions): string[] {
  const { countryCodes = ['US', 'UK', 'CA', 'AU', 'DE'], levels = ['MSC', 'PHD'], fields = [] } = options;
  const queries: string[] = [];

  // Primary queries by country + level
  for (const country of countryCodes.slice(0, 3)) {
    for (const level of levels.slice(0, 2)) {
      const levelLabel = level === 'BSC' ? 'undergraduate' : level === 'MSC' ? 'masters' : 'PhD';
      queries.push(
        `international scholarships 2025 2026 for ${levelLabel} students in ${country} deadline`,
      );
    }
  }

  // Field-specific queries
  for (const field of fields.slice(0, 2)) {
    const country = countryCodes[0] ?? 'international';
    queries.push(`fully funded scholarships ${field} ${country} 2025 apply`);
  }

  // Generic high-value queries if not enough variety
  if (queries.length < 3) {
    queries.push('fully funded international scholarships 2025 2026 masters PhD deadline apply');
    queries.push('scholarship opportunities international students 2025 no application fee deadline');
  }

  // Cap at 5 queries to stay polite
  return queries.slice(0, 5);
}

// ─── Serper Search ────────────────────────────────────────────────────────────

async function searchSerper(query: string, apiKey: string): Promise<SerperResult[]> {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({ q: query, num: 10 }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Serper returned HTTP ${response.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await response.json() as { organic?: any[] };
  const organic: SerperResult[] = (data.organic ?? []).map((r: any) => ({
    title: String(r.title ?? ''),
    snippet: String(r.snippet ?? ''),
    link: String(r.link ?? ''),
  }));
  return organic;
}

// ─── LLM Extraction ───────────────────────────────────────────────────────────

async function extractScholarship(
  result: SerperResult,
  config: { apiKey: string; baseUrl: string; model: string },
): Promise<ExtractedScholarship | null> {
  const systemPrompt = `You are a scholarship data extractor. Extract only what the source explicitly states. Never invent data. Use null for unknown values. Respond with valid JSON only, no markdown.`;

  const userContent = `Extract scholarship data from this search result.

Title: ${result.title}
Snippet: ${result.snippet}
URL: ${result.link}

Return JSON matching this exact schema:
{
  "title": "string (scholarship name)",
  "provider": "string or null",
  "countryCode": "ISO-2 country code or null if global",
  "level": "BSC" or "MSC" or "PHD" or null,
  "field": "string or null",
  "amount": "string or null (e.g. 'Full tuition + living allowance')",
  "fundingType": "full" or "partial" or "living" or "research" or null,
  "deadline": "ISO date string (YYYY-MM-DD) or null",
  "url": "string or null",
  "description": "1-2 sentences or null",
  "confidence": "high" or "medium" or "low"
}

Set confidence to "high" if title, provider, and deadline are all clear. "medium" if some data is inferred. "low" if very uncertain.`;

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`LLM API returned HTTP ${response.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await response.json() as { choices?: any[] };
  const content: string = data.choices?.[0]?.message?.content ?? '';
  if (!content) return null;

  const parsed = JSON.parse(content) as Partial<ExtractedScholarship>;

  // Validate required field
  if (!parsed.title || typeof parsed.title !== 'string' || parsed.title.trim() === '') {
    return null;
  }

  return {
    title: parsed.title.trim().slice(0, 300),
    provider: parsed.provider ? String(parsed.provider).slice(0, 200) : null,
    countryCode: parsed.countryCode ? String(parsed.countryCode).toUpperCase().slice(0, 10) : null,
    level: ['BSC', 'MSC', 'PHD'].includes(parsed.level ?? '') ? (parsed.level as ExtractedScholarship['level']) : null,
    field: parsed.field ? String(parsed.field).slice(0, 100) : null,
    amount: parsed.amount ? String(parsed.amount).slice(0, 200) : null,
    fundingType: ['full', 'partial', 'living', 'research'].includes(parsed.fundingType ?? '') ? (parsed.fundingType as ExtractedScholarship['fundingType']) : null,
    deadline: parsed.deadline ?? null,
    url: parsed.url ? String(parsed.url) : result.link,
    description: parsed.description ? String(parsed.description).slice(0, 1000) : null,
    confidence: ['high', 'medium', 'low'].includes(parsed.confidence ?? '') ? (parsed.confidence as ExtractedScholarship['confidence']) : 'low',
  };
}

// ─── Upsert Scholarship ───────────────────────────────────────────────────────

async function upsertScholarship(
  extracted: ExtractedScholarship,
  sourceUrl: string,
): Promise<'created' | 'updated' | 'skipped'> {
  if (extracted.confidence === 'low') return 'skipped';

  const titleNorm = extracted.title.toLowerCase().trim();

  // Dedup: find by normalised title match + provider or countryCode overlap
  const existing = await prisma.scholarship.findFirst({
    where: {
      title: { equals: extracted.title, mode: 'insensitive' },
      ...(extracted.provider ? { provider: { equals: extracted.provider, mode: 'insensitive' } } : {}),
    },
    select: { id: true, tags: true },
  });

  // Prepare tags array — always include "live-sourced"
  const existingTags = Array.isArray(existing?.tags) ? (existing.tags as string[]) : [];
  const newTags = Array.from(new Set([...existingTags, 'live-sourced']));

  // Validate and parse deadline
  let deadlineDate: Date | null = null;
  if (extracted.deadline) {
    const d = new Date(extracted.deadline);
    if (!isNaN(d.getTime()) && d > new Date()) {
      deadlineDate = d;
    }
  }

  const sharedData = {
    provider: extracted.provider,
    countryCode: extracted.countryCode,
    level: extracted.level as ('BSC' | 'MSC' | 'PHD') | null | undefined,
    field: extracted.field,
    amount: extracted.amount,
    fundingType: extracted.fundingType,
    description: extracted.description,
    url: extracted.url,
    sourceUrl,
    lastVerified: new Date(),
    isActive: true,
    tags: newTags,
  };

  if (existing) {
    await prisma.scholarship.update({
      where: { id: existing.id },
      data: sharedData,
    });

    // Upsert deadline if we have one
    if (deadlineDate) {
      await upsertScholarshipDeadline(existing.id, deadlineDate);
    }

    return 'updated';
  }

  // Create new scholarship
  const created = await prisma.scholarship.create({
    data: {
      title: extracted.title,
      ...sharedData,
    },
  });

  if (deadlineDate) {
    await upsertScholarshipDeadline(created.id, deadlineDate);
  }

  return 'created';
}

async function upsertScholarshipDeadline(scholarshipId: string, deadline: Date): Promise<void> {
  // Check if a similar future deadline already exists for this scholarship
  const existing = await prisma.scholarshipDeadline.findFirst({
    where: {
      scholarshipId,
      deadline: {
        gte: new Date(deadline.getTime() - 7 * 24 * 60 * 60 * 1000), // ± 7 days tolerance
        lte: new Date(deadline.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  if (!existing) {
    await prisma.scholarshipDeadline.create({
      data: {
        scholarshipId,
        deadline,
        term: 'Application Deadline',
      },
    });
  }
}

// ─── TTL Cache Check ──────────────────────────────────────────────────────────

async function wasRecentlyRefreshed(withinHours = 6): Promise<boolean> {
  const cutoff = new Date(Date.now() - withinHours * 60 * 60 * 1000);
  const recentlyVerified = await prisma.scholarship.count({
    where: {
      isActive: true,
      lastVerified: { gte: cutoff },
      tags: { array_contains: ['live-sourced'] },
    },
  });
  return recentlyVerified > 0;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export async function runLiveScholarshipRefresh(
  options: LiveRefreshOptions = {},
): Promise<LiveRefreshResult> {
  const start = Date.now();
  const result: LiveRefreshResult = {
    discovered: 0,
    upserted: 0,
    skipped: 0,
    errors: [],
    sourcesUsed: [],
    durationMs: 0,
  };

  // Guard: Serper key required
  const serperKey = process.env.SERPER_API_KEY;
  if (!serperKey) {
    result.errors.push('SERPER_API_KEY not configured');
    result.durationMs = Date.now() - start;
    return result;
  }

  // TTL cache guard (skip if force=false and data is fresh)
  if (!options.force) {
    try {
      const fresh = await wasRecentlyRefreshed(6);
      if (fresh) {
        result.errors.push('Recently refreshed, skipping (set force=true to bypass)');
        result.durationMs = Date.now() - start;
        return result;
      }
    } catch {
      // DB error checking cache — continue with refresh anyway
    }
  }

  result.sourcesUsed.push('Serper');

  // Check LLM availability
  const llmConfig = getOpenAIConfig();
  if (llmConfig) {
    result.sourcesUsed.push(process.env.OPENAI_API_KEY ? 'OpenAI' : 'OpenRouter');
  } else {
    logger.warn('[liveScholarship] No LLM API key — extraction skipped, search attempted');
  }

  // Build queries from user profiles if no explicit options
  let queryOptions = options;
  if (!options.countryCodes || options.countryCodes.length === 0) {
    try {
      const profiles = await prisma.userProfile.findMany({
        select: { targetCountries: true, intendedMajor: true, intendedLevel: true },
        take: 30,
      });
      const countries = [...new Set(
        profiles.flatMap(p => (p.targetCountries as string[] | null) ?? []).filter(Boolean),
      )].slice(0, 5);
      const fields = [...new Set(profiles.map(p => p.intendedMajor).filter(Boolean) as string[])].slice(0, 3);
      const levels = [...new Set(profiles.map(p => p.intendedLevel).filter(Boolean) as string[])].slice(0, 3);

      queryOptions = {
        ...options,
        countryCodes: countries.length > 0 ? countries : ['US', 'UK', 'CA', 'AU', 'DE'],
        fields: fields.length > 0 ? fields : [],
        levels: levels.length > 0 ? levels : ['MSC', 'PHD'],
      };
    } catch {
      // Fall back to defaults
    }
  }

  const queries = buildSearchQueries(queryOptions);
  logger.info(`[liveScholarship] running ${queries.length} queries`);

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];

    // 1s polite delay between requests (skip before first)
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    let searchResults: SerperResult[] = [];

    try {
      searchResults = await searchSerper(query, serperKey);
      logger.info(`[liveScholarship] query="${query.slice(0, 60)}…" → ${searchResults.length} results`);
    } catch (err) {
      const msg = `Serper search failed for query "${query.slice(0, 60)}": ${String(err)}`;
      result.errors.push(msg);
      logger.warn(`[liveScholarship] ${msg}`);
      continue;
    }

    result.discovered += searchResults.length;

    if (!llmConfig) {
      result.skipped += searchResults.length;
      continue;
    }

    // Extract + upsert each result
    for (const searchResult of searchResults) {
      try {
        const extracted = await extractScholarship(searchResult, llmConfig);
        if (!extracted) {
          result.skipped++;
          continue;
        }

        const outcome = await upsertScholarship(extracted, searchResult.link);
        if (outcome === 'created' || outcome === 'updated') {
          result.upserted++;
        } else {
          result.skipped++;
        }
      } catch (err) {
        const msg = `Failed to process result "${searchResult.title?.slice(0, 60)}": ${String(err)}`;
        result.errors.push(msg);
        result.skipped++;
        logger.warn(`[liveScholarship] ${msg}`);
      }
    }
  }

  result.durationMs = Date.now() - start;
  logger.info(
    `[liveScholarship] done — discovered=${result.discovered} upserted=${result.upserted} skipped=${result.skipped} errors=${result.errors.length} duration=${result.durationMs}ms`,
  );

  return result;
}
