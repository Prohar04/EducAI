/**
 * AI-powered scholarship discovery for the live search.
 *
 * Search order used by the controller:
 *   1. OpenAI Responses API with the hosted `web_search` tool  (this file)
 *   2. Serper (Google) web search as a fallback                (this file)
 *   3. Bundled local JSON dataset                              (scholarshipFallback.service)
 *   4. Database                                                (scholarship.service)
 *
 * Results from (1)/(2) are normalised into the same shape as the local
 * dataset so the controller can merge every source into one list.
 *
 * Everything here degrades gracefully — a missing API key or a network
 * error yields `null`, never a throw.
 */

import logger from '#src/config/logger.ts';
import { countryName } from '#src/utils/countries.ts';
import { searchSerper } from '#src/services/liveScholarship.service.ts';
import type { FallbackScholarship } from '#src/services/scholarshipFallback.service.ts';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AiScholarshipSearchParams {
  q?: string;
  countryCode?: string;
  level?: string;
  field?: string;
  fundingType?: string;
  financialNeed?: boolean;
  limit: number;
}

export type DiscoveryProvider = 'openai' | 'serper';

export interface DiscoveryResult {
  items: FallbackScholarship[];
  provider: DiscoveryProvider;
}

interface RawAiScholarship {
  title?: string;
  provider?: string | null;
  countryCode?: string | null;
  level?: string | null;
  field?: string | null;
  amount?: string | null;
  fundingType?: string | null;
  deadline?: string | null;
  url?: string | null;
  description?: string | null;
  requiresEnglishTest?: boolean | null;
  financialNeedRequired?: boolean | null;
  eligibleNationalities?: string[] | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SEARCH_MODEL = process.env.SCHOLARSHIP_SEARCH_MODEL || 'gpt-4o-mini';
const TTL_MS =
  Math.max(1, Number(process.env.AI_SCHOLARSHIP_SEARCH_TTL_HOURS) || 6) * 60 * 60 * 1000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    // NFD splits accented letters into base + combining mark; the next rule
    // drops the marks along with any other non-alphanumeric character.
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const toNullable = (value?: string | null) => {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed ? trimmed : null;
};

const LEVELS = ['BSC', 'MSC', 'PHD'] as const;
const FUNDING_TYPES = ['full', 'partial', 'living', 'research'] as const;

function normalizeLevel(value?: string | null): FallbackScholarship['level'] {
  const upper = (value ?? '').toUpperCase();
  return (LEVELS as readonly string[]).includes(upper)
    ? (upper as FallbackScholarship['level'])
    : null;
}

function normalizeFundingType(value?: string | null): string | null {
  const lower = (value ?? '').toLowerCase();
  return (FUNDING_TYPES as readonly string[]).includes(lower) ? lower : null;
}

/** Map a raw AI/Serper record into the shared FallbackScholarship shape. */
function toScholarship(
  raw: RawAiScholarship,
  source: DiscoveryProvider,
  fallbackCountry: string | null,
): FallbackScholarship | null {
  const title = toNullable(raw.title);
  if (!title) return null;

  const code =
    toNullable(raw.countryCode)?.toUpperCase().slice(0, 2) ?? fallbackCountry ?? null;
  const id = `${source}-scholarship:${code ?? 'GLOBAL'}:${slugify(title)}`;
  const nowIso = new Date().toISOString();

  const deadlineRaw = toNullable(raw.deadline);
  const deadlines: FallbackScholarship['deadlines'] = [];
  if (deadlineRaw) {
    const parsed = new Date(deadlineRaw);
    if (!Number.isNaN(parsed.getTime()) && parsed.getTime() >= Date.now()) {
      deadlines.push({
        id: `${id}:deadline:${parsed.toISOString().slice(0, 10)}`,
        scholarshipId: id,
        term: 'Application Deadline',
        deadline: parsed.toISOString(),
        createdAt: null,
      });
    }
  }

  return {
    id,
    title,
    provider: toNullable(raw.provider),
    countryCode: code,
    level: normalizeLevel(raw.level),
    field: toNullable(raw.field),
    url: toNullable(raw.url),
    description: toNullable(raw.description),
    amount: toNullable(raw.amount),
    fundingType: normalizeFundingType(raw.fundingType),
    minGpa: null,
    requiresEnglishTest: raw.requiresEnglishTest === true,
    financialNeedRequired: raw.financialNeedRequired === true,
    eligibleNationalities: Array.isArray(raw.eligibleNationalities)
      ? raw.eligibleNationalities.filter((n): n is string => typeof n === 'string')
      : null,
    tags: [`${source}-sourced`, 'live-sourced', 'web-search'],
    sourceUrl: toNullable(raw.url),
    lastVerified: nowIso,
    isActive: true,
    createdAt: null,
    updatedAt: null,
    deadlines,
  };
}

/** Build the natural-language search prompt from the structured filters. */
function buildQueryText(params: AiScholarshipSearchParams): string {
  const parts: string[] = [];
  const year = new Date().getFullYear();

  if (params.q?.trim()) parts.push(params.q.trim());

  const country = countryName(params.countryCode);
  if (country) parts.push(`in ${country}`);

  if (params.level) {
    const label =
      params.level.toUpperCase() === 'BSC'
        ? 'undergraduate'
        : params.level.toUpperCase() === 'PHD'
          ? 'PhD'
          : "master's";
    parts.push(`for ${label} students`);
  }

  if (params.field?.trim()) parts.push(`in ${params.field.trim()}`);
  if (params.fundingType) parts.push(`${params.fundingType}-funding`);
  if (params.financialNeed) parts.push('with financial-need support');

  const subject = parts.length > 0 ? parts.join(' ') : 'international students';
  return `Scholarships for international students ${subject} — open applications for ${year} and ${year + 1}.`;
}

// ─── OpenAI web search ────────────────────────────────────────────────────────

const RESULT_SCHEMA = `{
  "scholarships": [
    {
      "title": "string (official scholarship name)",
      "provider": "string or null (funding body / university)",
      "countryCode": "ISO 3166-1 alpha-2 code, or null if global",
      "level": "BSC | MSC | PHD | null",
      "field": "string or null",
      "amount": "string or null (e.g. 'Full tuition + stipend')",
      "fundingType": "full | partial | living | research | null",
      "deadline": "YYYY-MM-DD or null",
      "url": "official application URL or null",
      "description": "1-2 sentence summary or null",
      "requiresEnglishTest": "boolean",
      "financialNeedRequired": "boolean",
      "eligibleNationalities": "array of country names or null"
    }
  ]
}`;

async function callOpenAiWebSearch(
  params: AiScholarshipSearchParams,
): Promise<RawAiScholarship[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const queryText = buildQueryText(params);
  const instructions = `You are a scholarship research assistant. Use web search to find REAL, currently-open scholarships that match the user's request. Only report scholarships you can verify from a source. Never invent scholarships, deadlines, or URLs — use null when unknown. Return between 1 and ${Math.min(params.limit, 15)} results. Respond with ONLY valid JSON (no markdown) matching this schema:\n${RESULT_SCHEMA}`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: SEARCH_MODEL,
        tools: [{ type: 'web_search' }],
        instructions,
        input: queryText,
        max_output_tokens: 3000,
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!response.ok) {
      logger.warn(`[aiScholarshipSearch] OpenAI HTTP ${response.status}`);
      return null;
    }

    const data = (await response.json()) as {
      output_text?: string;
      output?: Array<{
        type?: string;
        content?: Array<{ type?: string; text?: string }>;
      }>;
    };

    // Prefer the SDK-style convenience field; fall back to walking `output`.
    let text = data.output_text ?? '';
    if (!text && Array.isArray(data.output)) {
      text = data.output
        .filter((o) => o.type === 'message')
        .flatMap((o) => o.content ?? [])
        .filter((c) => c.type === 'output_text')
        .map((c) => c.text ?? '')
        .join('\n');
    }
    if (!text.trim()) return null;

    const parsed = parseScholarshipJson(text);
    return parsed;
  } catch (err) {
    logger.warn(`[aiScholarshipSearch] OpenAI web search failed: ${String(err)}`);
    return null;
  }
}

/** Tolerant JSON extraction — strips code fences and finds the JSON body. */
function parseScholarshipJson(text: string): RawAiScholarship[] | null {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  const candidates = [cleaned];
  const braceStart = cleaned.indexOf('{');
  const braceEnd = cleaned.lastIndexOf('}');
  if (braceStart > 0 && braceEnd > braceStart) {
    candidates.push(cleaned.slice(braceStart, braceEnd + 1));
  }

  for (const candidate of candidates) {
    try {
      const obj = JSON.parse(candidate) as
        | { scholarships?: RawAiScholarship[] }
        | RawAiScholarship[];
      if (Array.isArray(obj)) return obj;
      if (Array.isArray(obj.scholarships)) return obj.scholarships;
    } catch {
      // try next candidate
    }
  }
  return null;
}

// ─── Serper fallback ──────────────────────────────────────────────────────────

async function callSerper(
  params: AiScholarshipSearchParams,
): Promise<RawAiScholarship[] | null> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return null;

  const country = countryName(params.countryCode);
  const bits = [
    params.q?.trim() || 'scholarships for international students',
    country ? `in ${country}` : '',
    params.field?.trim() ?? '',
    params.fundingType ? `${params.fundingType} funding` : '',
    `${new Date().getFullYear()} deadline apply`,
  ].filter(Boolean);

  try {
    const organic = await searchSerper(bits.join(' '), apiKey);
    if (organic.length === 0) return null;
    return organic.slice(0, params.limit).map((r) => ({
      title: r.title,
      provider: null,
      countryCode: params.countryCode ?? null,
      level: null,
      field: params.field ?? null,
      amount: null,
      fundingType: params.fundingType ?? null,
      deadline: null,
      url: r.link,
      description: r.snippet || null,
      requiresEnglishTest: false,
      financialNeedRequired: false,
      eligibleNationalities: null,
    }));
  } catch (err) {
    logger.warn(`[aiScholarshipSearch] Serper fallback failed: ${String(err)}`);
    return null;
  }
}

// ─── TTL cache ────────────────────────────────────────────────────────────────

const cache = new Map<string, { expiresAt: number; value: DiscoveryResult }>();

function cacheKey(params: AiScholarshipSearchParams): string {
  return JSON.stringify({
    q: params.q?.trim().toLowerCase() ?? '',
    c: params.countryCode ?? '',
    l: params.level ?? '',
    f: params.field?.trim().toLowerCase() ?? '',
    ft: params.fundingType ?? '',
    fn: params.financialNeed ? 1 : 0,
  });
}

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * Discover scholarships from the web: OpenAI web search first, Serper as a
 * fallback. Cached per normalised query for `AI_SCHOLARSHIP_SEARCH_TTL_HOURS`.
 * Returns `null` when no provider is configured or nothing usable comes back.
 */
export async function discoverScholarships(
  params: AiScholarshipSearchParams,
): Promise<DiscoveryResult | null> {
  if (!process.env.OPENAI_API_KEY && !process.env.SERPER_API_KEY) return null;

  const key = cacheKey(params);
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value;

  const country = params.countryCode ?? null;

  let raw = await callOpenAiWebSearch(params);
  let provider: DiscoveryProvider = 'openai';

  if (!raw || raw.length === 0) {
    raw = await callSerper(params);
    provider = 'serper';
  }

  if (!raw || raw.length === 0) {
    // Cache the miss briefly so a burst of searches does not hammer the APIs.
    cache.set(key, { expiresAt: Date.now() + 60_000, value: { items: [], provider } });
    return null;
  }

  const items = raw
    .map((r) => toScholarship(r, provider, country))
    .filter((s): s is FallbackScholarship => s !== null);

  const value: DiscoveryResult = { items, provider };
  cache.set(key, { expiresAt: Date.now() + TTL_MS, value });
  logger.info(
    `[aiScholarshipSearch] provider=${provider} discovered=${items.length} q="${(params.q ?? '').slice(0, 40)}" country=${country ?? '-'}`,
  );
  return value;
}

/** Test/ops helper — clears the in-memory discovery cache. */
export function clearScholarshipDiscoveryCache(): void {
  cache.clear();
}
