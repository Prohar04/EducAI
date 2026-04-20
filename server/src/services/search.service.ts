/**
 * SearchService — LLM query-rewrite + Serper search + PostgreSQL TTL cache.
 *
 * Architecture (from docs/search-architecture-decision.md):
 *   1. Normalize query → SHA-256 cache key
 *   2. Check SearchCache (PostgreSQL) — return immediately on HIT
 *   3. MISS → call OpenRouter LLM to rewrite query into 3 search queries
 *   4. Parallel Serper search for all rewrites
 *   5. Normalize + deduplicate results
 *   6. Persist to SearchCache with 24h TTL
 *   7. Return results
 */

import crypto from 'node:crypto';
import prisma from '#src/config/database.ts';

// ── Types ────────────────────────────────────────────────────────────────────

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface IntelligentSearchResponse {
  cacheHit: boolean;
  query: string;
  rewrites: string[];
  results: SearchResult[];
  cachedAt: string | null;
  expiresAt: string | null;
}

// ── Config ───────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_RESULTS_PER_QUERY = 5;
const SERPER_URL = 'https://google.serper.dev/search';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'; // fallback

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

function hashQuery(normalized: string): string {
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

// ── LLM query rewrite ────────────────────────────────────────────────────────

async function rewriteQuery(query: string): Promise<string[]> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL : OPENROUTER_URL;
  const model = openaiKey ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';
  if (!apiKey) {
    return [query];
  }

  const prompt = `You are a search query optimizer for a university and education search engine.
Given a user's natural language query, generate exactly 3 precise, distinct search queries that will return the most relevant results from Google.

User query: "${query}"

Return ONLY a JSON array of 3 strings (search queries), no explanation, no markdown:
["query 1", "query 2", "query 3"]`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return [query];
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = data?.choices?.[0]?.message?.content?.trim() ?? '';

    // Parse the JSON array
    const parsed = JSON.parse(content) as unknown;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return (parsed as string[]).slice(0, 3).map(String);
    }
    return [query];
  } catch {
    return [query];
  }
}

// ── Serper search ────────────────────────────────────────────────────────────

async function serperSearch(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERPER_APIKEY || process.env.SERPER_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(SERPER_URL, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, num: MAX_RESULTS_PER_QUERY }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) return [];

    const data = await response.json() as { organic?: Array<{ title?: string; link?: string; snippet?: string }> };
    return (data.organic ?? []).map(item => ({
      title: item.title ?? '',
      url: item.link ?? '',
      snippet: item.snippet ?? '',
    }));
  } catch {
    return [];
  }
}

// ── Deduplication ────────────────────────────────────────────────────────────

function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return results.filter(r => {
    if (!r.url || seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
}

// ── Main search function ─────────────────────────────────────────────────────

export async function intelligentSearch(rawQuery: string): Promise<IntelligentSearchResponse> {
  const normalized = normalizeQuery(rawQuery);
  const cacheKey = hashQuery(normalized);

  // 1. Check cache
  const cached = await prisma.searchCache.findFirst({
    where: {
      key: cacheKey,
      expiresAt: { gt: new Date() },
    },
  });

  if (cached) {
    return {
      cacheHit: true,
      query: cached.query,
      rewrites: cached.rewrites as string[],
      results: cached.results as unknown as SearchResult[],
      cachedAt: cached.createdAt.toISOString(),
      expiresAt: cached.expiresAt.toISOString(),
    };
  }

  // 2. LLM query rewrite
  const rewrites = await rewriteQuery(normalized);

  // 3. Parallel Serper search
  const searchPromises = rewrites.map(q => serperSearch(q));
  const rawResults = (await Promise.all(searchPromises)).flat();

  // 4. Deduplicate
  const results = deduplicateResults(rawResults);

  // 5. Persist to cache
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
  await prisma.searchCache.upsert({
    where: { key: cacheKey },
    create: {
      key: cacheKey,
      query: rawQuery,
      // JSON.parse(JSON.stringify(...)) strips TypeScript types → plain JSON-compatible value
      rewrites: JSON.parse(JSON.stringify(rewrites)),
      results: JSON.parse(JSON.stringify(results)),
      expiresAt,
    },
    update: {
      query: rawQuery,
      rewrites: JSON.parse(JSON.stringify(rewrites)),
      results: JSON.parse(JSON.stringify(results)),
      expiresAt,
    },
  });

  return {
    cacheHit: false,
    query: rawQuery,
    rewrites,
    results,
    cachedAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

// ── Cache management ─────────────────────────────────────────────────────────

export async function getRecentSearches(limit = 20): Promise<Array<{ query: string; cachedAt: string; expiresAt: string; resultCount: number }>> {
  const rows = await prisma.searchCache.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { query: true, createdAt: true, expiresAt: true, results: true },
  });

  return rows.map(r => ({
    query: r.query,
    cachedAt: r.createdAt.toISOString(),
    expiresAt: r.expiresAt.toISOString(),
    resultCount: Array.isArray(r.results) ? (r.results as unknown[]).length : 0,
  }));
}
