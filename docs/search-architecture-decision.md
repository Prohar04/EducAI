# Search Architecture Decision

**Date:** 2026-04-12  
**Decision owner:** Claude Sonnet 4.6

---

## Problem Statement

EducAI's current program search is a naive SQL `LIKE` query with no intent understanding. The uploaded University Search API reference demonstrates a superior pattern: NLP intent parsing → LLM query rewriting → live Serper search → PostgreSQL TTL cache → normalized results.

The question is **where** this new layer belongs: inside the Express server or inside the FastAPI ai-server.

---

## Options Considered

### Option A — Integrate into FastAPI ai-server

**Pros:**
- AI/LLM code already lives there
- Python has richer NLP ecosystem
- Consistent with RAG pipeline philosophy

**Cons:**
- ai-server is already complex (RAG, chat, strategy, recommendations)
- Cross-service HTTP call from server → ai-server for every search
- Prisma PostgreSQL access from Python adds complexity
- Harder to cache at the layer closest to the client

### Option B — Integrate into Express server (CHOSEN)

**Pros:**
- Programs/search is a server-layer concern — stays co-located with program routes
- Prisma ORM already configured for PostgreSQL in Express → cache writes are trivial
- LLM query rewriting can be a simple HTTP call out to ai-server or OpenRouter directly
- Cache key (SHA-256) + TTL logic is pure Node.js — no Python overhead
- Single service owns both cache and fallback path
- Easier to extend later (add vector search, etc.)

**Cons:**
- LLM call from Node.js requires direct OpenRouter HTTP — adds one small dependency
- Can't reuse ai-server's existing `generate_text` wrapper directly

**Decision: Option B — Express server owns the search intelligence layer.**

---

## Architecture Design

```
Client (web)
    │
    ▼
POST /search/intelligent  {query: "affordable CS masters in Germany"}
    │
    ▼
SearchService (Express)
    │
    ├─ 1. Normalize query (trim, lowercase, strip diacritics)
    ├─ 2. SHA-256(normalized_query) → cache_key
    │
    ├─ 3. SELECT * FROM SearchCache WHERE key = ? AND expiresAt > now()
    │       ├─ HIT → return cached results immediately
    │       └─ MISS → proceed
    │
    ├─ 4. LLM query rewrite (OpenRouter → gpt-4o-mini)
    │     Input:  "affordable CS masters in Germany"
    │     Output: ["Computer Science masters Germany tuition fees", 
    │              "affordable graduate programs Germany English", ...]
    │
    ├─ 5. Serper.dev parallel search (all rewritten queries)
    │     Returns: [{title, url, snippet}, ...]
    │
    ├─ 6. Normalize + deduplicate results
    │
    ├─ 7. INSERT INTO SearchCache (key, query, results, expiresAt)
    │     TTL: 24 hours
    │
    └─ 8. Return {cacheHit: false, results: [...]}
```

---

## Database Model

```prisma
model SearchCache {
  id         String   @id @default(cuid())
  key        String   @unique          // SHA-256 of normalized query
  query      String                    // original user query
  results    Json                      // array of SearchResult objects
  expiresAt  DateTime
  createdAt  DateTime @default(now())
}
```

---

## API Surface

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/search/intelligent` | POST | yes | NLP search with LLM rewrite + Serper |
| `/search/cached` | GET | yes | List recent cached searches |

### Request
```json
{ "query": "affordable CS masters in Germany under 15k" }
```

### Response
```json
{
  "cacheHit": false,
  "query": "affordable CS masters in Germany under 15k",
  "rewrites": ["Computer Science masters Germany fees", "..."],
  "results": [
    {
      "title": "MSc Computer Science — TU Munich",
      "url": "https://...",
      "snippet": "Tuition: ~250 EUR/semester..."
    }
  ],
  "cachedAt": "2026-04-12T10:00:00Z",
  "expiresAt": "2026-04-13T10:00:00Z"
}
```

---

## What is Preserved from Existing Code

- `WebSearch` class in ai-server: unchanged — still used by RAG pipeline and chat
- `searchPrograms` controller: unchanged — still serves keyword fallback
- ChromaDB RAG pipeline: unchanged — still used for deep match (POST /match/run)
- All existing Serper usage: unchanged

The new `SearchService` is **additive** — it adds a new route and a new Prisma model without modifying any existing code path.

---

## Security Notes

- LLM API key (OPENROUTER_API_KEY) accessed via `process.env` — never hardcoded
- Cache key is SHA-256 of normalized query — no PII stored as key
- Auth middleware protects `/search/*` routes
- SQL injection impossible — Prisma ORM with parameterized queries
