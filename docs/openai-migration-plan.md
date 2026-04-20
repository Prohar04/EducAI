# OpenAI Migration Plan — EducAI

**Date:** 2026-04-20  
**Status:** Complete

---

## Goal

Migrate all AI generation, reasoning, and summarization features from OpenRouter (proxy) and other providers to the official OpenAI API as the primary provider.

## What Changed

### Server (`/server/src/services/`)

All 8 server-side AI services now prefer `OPENAI_API_KEY` over `OPENROUTER_API_KEY`:

- `chat.service.ts` — ChatGPT assistant (OpenAI priority 1 in the fallback chain)
- `sop.service.ts` — SOP Builder
- `cv.service.ts` — CV Builder
- `gapfix.service.ts` — Gap Fix Recommender
- `career.service.ts` — Career Outcome Predictor
- `immigration.service.ts` — PR & Immigration Guide
- `professors.service.ts` — LLM extraction after Serper search
- `search.service.ts` — LLM query rewriting before Serper search

**Pattern used in each service:**
```typescript
const openaiKey = process.env.OPENAI_API_KEY;
const openrouterKey = process.env.OPENROUTER_API_KEY;
const apiKey = openaiKey || openrouterKey;
const apiUrl = openaiKey ? OPENAI_URL : OPENROUTER_URL;
const model = openaiKey ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';
```

OpenRouter-specific headers (`HTTP-Referer`, `X-Title`) removed from all services.

### AI-Server (`/ai-server/app/`)

- `core/config.py` — Added `OPENAI_API_KEY` field
- `domains/reasoning/llm_provider.py` — Added `LLMProvider.OPENAI` enum value, `_generate_text_openai()` function, and OpenAI as priority 0 in the auto-detection chain
- `domains/embeddings/openapi.py` — Now uses direct OpenAI embeddings API when `OPENAI_API_KEY` is set; falls back to OpenRouter proxy

### Env Files

- `server/.env.example` — Added `OPENAI_API_KEY=` placeholder (before `OPENROUTER_API_KEY`)
- `ai-server/.env.example` — Added `OPENAI_API_KEY=""` as primary provider config
- `server/.env` — Added `OPENAI_API_KEY=` (empty; fill with your key)
- `ai-server/.env` — Added `OPENAI_API_KEY=""` (empty; fill with your key)

## What Was NOT Changed

- **Serper** (`SERPER_API_KEY`) — Search/retrieval tool, not AI. Kept as-is.
- **Firecrawl** (`FIRECRAWL_API_KEY`) — Web scraper, not AI. Kept as-is.
- **ChromaDB** — Vector store, not AI. Kept as-is.
- **`rag_pipeline.py`** — Hard-codes OpenRouter URL for the background RAG extraction pipeline. Left on OpenRouter to avoid breaking the long-running scrape → extract → persist pipeline. OpenRouter's proxy endpoint is equivalent for this use case.
- **`xai.py`** — xAI-specific module; left intact as an optional provider.
- **Anthropic, Gemini, Groq keys** — Still accepted as fallback in chat.service.ts; no code removed to avoid breaking existing deployments.

## How to Activate OpenAI

1. Add your OpenAI API key to `server/.env`:
   ```
   OPENAI_API_KEY=sk-proj-...
   ```
2. Add the same key (or a separate one) to `ai-server/.env`:
   ```
   OPENAI_API_KEY="sk-proj-..."
   ```
3. Both services will automatically prefer OpenAI when the key is present.
4. If `OPENAI_API_KEY` is empty, all services fall back to `OPENROUTER_API_KEY` seamlessly.

## Verification

After migration, all builds pass:
- `server/`: lint ✅, build ✅, 62/62 tests ✅
- `web/`: lint ✅, build ✅
- No secrets in tracked files ✅
