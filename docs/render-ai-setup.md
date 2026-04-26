# Render Setup — FastAPI AI Server

## Service configuration
| Setting | Value |
|---------|-------|
| Service type | Web Service |
| Runtime | Python |
| Python version | 3.13 |
| Region | Oregon (US West) — same as Express API |
| Plan | Free |
| Root Directory | `ai-server` |
| Build Command | `pip install uv && uv pip install --system fastapi[standard] uvicorn pydantic-settings httpx loguru python-dotenv openai langchain langchain-openai prisma psycopg2-binary sqlmodel firecrawl-py apify-client` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port 8001` |
| Health Check Path | `/api/v1/health` |

### Alternative: Docker deployment (recommended if build is slow)
Render can deploy from the `ai-server/Dockerfile` directly:
- Environment: Docker
- Dockerfile path: `ai-server/Dockerfile`
- This is more reliable for complex Python deps with native extensions.

## Environment variables

### Required
| Variable | How to get |
|----------|-----------|
| `MASTER_APIKEY` | `openssl rand -hex 32` — must match `AI_SERVER_API_KEY` on Express |
| `DATABASE_URL` | Neon connection string (same as Express, or a separate branch) |

### LLM Provider (at least one required)
| Variable | Provider |
|----------|---------|
| `OPENAI_API_KEY` | OpenAI (recommended — best quality) |
| `OPENROUTER_API_KEY` | OpenRouter (free tier available) |
| `GEMINI_API_KEY` | Google Gemini (free tier) |
| `GROQ_API_KEY` | Groq (fast, free tier) |
| `LLM_PROVIDER` | Override: `openai` / `openrouter` / `gemini` / `groq` / `xai` |
| `LLM_MODEL` | Override: e.g. `gpt-4o-mini` |

The AI server auto-selects the first available provider in order: OpenAI → Groq → OpenRouter → Gemini → xAI.

### Express API back-reference
| Variable | Value |
|----------|-------|
| `SERVER_BASE_URL` | `https://educai-api.onrender.com` |
| `INGEST_API_KEY` | Same as Express `INGEST_API_KEY` |

### Optional features
| Variable | Feature |
|----------|---------|
| `SERPER_API_KEY` | Web search for visa/scholarship/news queries |
| `FIRECRAWL_API_KEY` | Page extraction for web citations |
| `APIFY_APIKEY` | University website scraping |
| `CHROMADB_HOST` | Vector search / RAG pipeline (not available on free tier) |
| `CHROMADB_PORT` | Vector search (default 8881) |

**ChromaDB note**: On Render free tier there is no persistent disk and ChromaDB runs as a separate service. Leave `CHROMADB_HOST` unset — the AI server boots fine without it; RAG features are gracefully disabled.

## Health endpoints
| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/health` | Basic liveness |
| `GET /api/v1/health/llm` | LLM provider config check |

## Free tier cold start
Same as Express — free services sleep after 15 min. The Express chat service has a 35s timeout when calling the AI server. The Next.js proxy adds another 3s margin (38s total), which is enough to absorb a Render cold start.

## API key pairing (critical)
The Express API sends requests to the AI server with:
```
X-API-Key: <AI_SERVER_API_KEY>
```
The AI server validates this against its `MASTER_APIKEY`. These two values **must be identical**.
