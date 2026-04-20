# AI Provider Audit — EducAI

**Audited:** 2026-04-20  
**Verified:** 2026-04-20 — all builds passing, OpenAI confirmed as active provider

---

## Server-Side Services (`/server/src/services/`)

| File | Previous Provider | Model | Feature | Env Var Used | Migrated to OpenAI |
|------|-------------------|-------|---------|--------------|-------------------|
| `chat.service.ts` | Groq → OpenRouter → Anthropic → Gemini | llama-3.3-70b / gpt-4o-mini / claude-haiku / gemini-2.0 | Floating AI assistant | `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` | ✅ OpenAI added as priority 1 |
| `sop.service.ts` | OpenRouter | openai/gpt-4o-mini | SOP Builder | `OPENROUTER_API_KEY` | ✅ |
| `cv.service.ts` | OpenRouter | openai/gpt-4o-mini | CV Builder | `OPENROUTER_API_KEY` | ✅ |
| `professors.service.ts` | Serper (search) + OpenRouter (LLM extraction) | openai/gpt-4o-mini | Professor Finder | `SERPER_API_KEY`, `OPENROUTER_API_KEY` | ✅ LLM part only |
| `search.service.ts` | Serper (search) + OpenRouter (query rewrite) | openai/gpt-4o-mini | Intelligent search | `SERPER_API_KEY`, `OPENROUTER_API_KEY` | ✅ LLM part only |
| `gapfix.service.ts` | OpenRouter | openai/gpt-4o-mini | Gap Fix Recommender | `OPENROUTER_API_KEY` | ✅ |
| `career.service.ts` | OpenRouter | openai/gpt-4o-mini | Career Outcome Predictor | `OPENROUTER_API_KEY` | ✅ |
| `immigration.service.ts` | OpenRouter | openai/gpt-4o-mini | PR & Immigration Guide | `OPENROUTER_API_KEY` | ✅ |

---

## AI-Server Python Services (`/ai-server/app/`)

| File | Previous Provider(s) | Feature | Migrated to OpenAI |
|------|---------------------|---------|-------------------|
| `domains/reasoning/llm_provider.py` | Groq → OpenRouter → Gemini → xAI | Unified LLM abstraction for all ai-server features | ✅ OpenAI added as priority 0 |
| `domains/embeddings/openapi.py` | OpenRouter (proxied text-embedding-3-small) | Vector embeddings for RAG/ChromaDB | ✅ Direct OpenAI embeddings API |
| `api/v1/chat.py` | (uses llm_provider) | Multi-turn chat with web search | ✅ Inherits from llm_provider |
| `api/v1/strategy.py` | (uses llm_provider) | Strategy report generation | ✅ Inherits from llm_provider |
| `domains/reasoning/rag_pipeline.py` | OpenRouter (via LangChain proxy) | RAG pipeline — query rewrite + extraction | ✅ Uses `OPENAI_API_KEY` directly when set; falls back to OpenRouter via LangChain |
| `api/v1/scrape_match.py` | (uses llm_provider) | Scrape + match + rank programs | ✅ Inherits from llm_provider |
| `domains/reasoning/xai.py` | xAI Grok | xAI-specific integration | Kept as optional fallback in llm_provider |

---

## Retrieval / Scraping Tools (Not AI — Kept Separate)

| Tool | Provider | Feature | Action |
|------|----------|---------|--------|
| Serper | `SERPER_API_KEY` | Google search for Professor Finder and intelligent search | Kept as-is — retrieval tool, not AI |
| Firecrawl | `FIRECRAWL_API_KEY` | Web scraping for program data | Kept as-is — scraping tool, not AI |
| ChromaDB | Local/hosted | Vector store for RAG | Kept as-is — vector DB, not AI |

---

## Environment Variable Summary (Post-Migration)

| Service | Primary Key | Fallback Key |
|---------|-------------|--------------|
| server/ | `OPENAI_API_KEY` | `OPENROUTER_API_KEY` |
| ai-server/ | `OPENAI_API_KEY` | `GROQ_API_KEY` → `OPENROUTER_API_KEY` → `GEMINI_API_KEY` → `XAI_API_KEY` |

---

## Provider Priority After Migration

### Server chat.service.ts
1. OpenAI (`gpt-4o-mini`) — **new primary**
2. Groq (`llama-3.3-70b-versatile`)
3. OpenRouter (`meta-llama/llama-3.3-70b-instruct:free`)
4. Anthropic (`claude-haiku-4-5`)
5. Gemini (`gemini-2.0-flash-exp`)
6. Python ai-server fallback

### Server service functions (SOP, CV, GapFix, Career, Immigration, Professor, Search)
1. OpenAI (`gpt-4o-mini`) — **new primary**
2. OpenRouter (`openai/gpt-4o-mini`) — fallback

### ai-server llm_provider.py
1. OpenAI (`gpt-4o-mini`) — **new primary**
2. Groq (`llama-3.3-70b-versatile`)
3. OpenRouter (`openrouter/free`)
4. Gemini (`gemini-2.0-flash-exp`)
5. xAI (`grok-beta`)
