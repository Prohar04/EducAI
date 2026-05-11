# EducAI AI Server

A FastAPI microservice that powers AI-driven operations for the EducAI platform.

## Overview

The AI Server is responsible for:

- **Chat & Conversation** — Context-aware chatbot with full user profile integration
- **Recommendations** — AI-powered program and scholarship suggestions
- **Program Matching** — Live university program scraping and scoring
- **Application Strategy** — LLM-generated admission plans and improvement strategies

## Architecture

```text
FastAPI Server (Python 3.13)
├── Health Endpoints (liveness/readiness probes)
├── Chat API (GPT-4o-mini + fallbacks)
├── Recommendations Engine (eligibility + probability scoring)
├── Module 1 Operations (scraping, syncing, matching)
└── Strategy Generation (admission forecasting)
```

**Authentication:** All endpoints (except `/health`) require `X-API-Key` header matching `MASTER_APIKEY`.

**LLM Providers:** OpenAI (primary) → Groq → OpenRouter → Gemini (fallbacks)

**Deployment:** Render.com (auto-deploys from `main` branch via `render.yaml`)

## Local Setup

### Prerequisites

- Python 3.11+ (3.13 recommended)
- pip or conda
- Virtual environment (venv recommended)

### 1. Create & Activate Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate  # macOS/Linux
# or
.venv\Scripts\activate  # Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with required variables:

```env
MASTER_APIKEY=your-shared-secret-with-express-server
OPENAI_API_KEY=sk-...  # Primary LLM
GROQ_API_KEY=...       # Optional fallback
SERPER_API_KEY=...     # Web search (optional)
FIRECRAWL_API_KEY=...  # Web scraping (optional)
```

### 4. Start the Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Server runs on `http://localhost:8001`

**Swagger Docs:** `http://localhost:8001/docs`

## API Endpoints

### Health Checks (No Auth Required)

| Method | Endpoint | Purpose |
| -------- | ---------- | --------- |
| `GET` | `/health` | General liveness probe |
| `HEAD` | `/health` | Lightweight liveness (load balancers) |
| `GET` | `/health/llm` | LLM provider status |

### Protected Endpoints (Require API Key)

| Method | Endpoint | Purpose |
| -------- | ---------- | --------- |
| `POST` | `/api/v1/chat` | Conversational chat |
| `GET` | `/api/v1/edu/...` | Recommendations |
| `POST` | `/api/v1/module1/...` | Program matching & sync |
| `POST` | `/api/v1/module1/strategy` | Application strategy |

## Environment Variables

| Variable | Required | Description |
| ---------- | ---------- | ------------- |
| `MASTER_APIKEY` | ✅ | Shared secret with Express server |
| `OPENAI_API_KEY` | ✅ | GPT-4o-mini or fallback LLM |
| `GROQ_API_KEY` | Optional | Free-tier LLM fallback |
| `OPENROUTER_API_KEY` | Optional | Secondary LLM fallback |
| `GEMINI_API_KEY` | Optional | Tertiary LLM fallback |
| `LLM_PROVIDER` | Optional | Override active: `openai\|groq\|openrouter\|gemini` |
| `SERPER_API_KEY` | Optional | Web search for professor discovery |
| `FIRECRAWL_API_KEY` | Optional | University page scraping |
| `CHROMADB_HOST` | Optional | Vector DB host (disabled on Render free) |
| `CHROMADB_PORT` | Optional | Vector DB port |

## Project Structure

```text
ai-server/
├── app/
│   ├── main.py                    # FastAPI app initialization
│   ├── api/v1/                    # API route modules
│   │   ├── health.py              # Health check endpoints
│   │   ├── chat.py                # Chatbot endpoint
│   │   ├── recommendations.py     # Recommendations engine
│   │   ├── module1_sync.py        # Program sync
│   │   ├── scrape_match.py        # Program matching
│   │   └── strategy.py            # Strategy generation
│   ├── domains/                   # Business logic
│   │   ├── reasoning/             # LLM reasoning chains
│   │   ├── scrapping/             # Web scraping
│   │   ├── searching/             # Search operations
│   │   ├── embeddings/            # Vector operations
│   │   └── ingestion/             # Data ingestion
│   ├── db/                        # Database layer
│   │   └── prisma_connect.py      # Prisma client setup
│   ├── middleware/                # Middleware
│   │   ├── secure_keys.py         # API key validation
│   │   └── audit_log.py           # Request logging
│   ├── core/                      # Configuration
│   │   ├── config.py              # Settings/env
│   │   └── logger.py              # Logging setup
│   ├── LLM/                       # Provider abstraction
│   └── schemas/                   # Pydantic models
├── prisma/                        # Database schema
│   └── schema.prisma
├── scripts/                       # Utility scripts
├── tests/                         # Test suite
├── requirements.txt               # Python dependencies
├── pyproject.toml                 # Project metadata
└── README.md                      # This file
```

## Testing

```bash
pytest --tb=short -q
```

## Linting & Code Quality

```bash
ruff check .
```

## Deployment

### Render.com (Automatic)

The project includes `render.yaml` blueprint for automatic deployment:

1. Push code to `main` branch
2. Render automatically rebuilds and deploys
3. Health check: `GET /health` (must return 200)

### Local Docker

```bash
docker build -t educai-ai-server .
docker run -p 8001:8001 --env-file .env educai-ai-server
```

## Common Issues

### Issue: `ModuleNotFoundError: No module named 'fastapi'`

**Solution:** Ensure virtual environment is activated and dependencies installed:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

### Issue: `MASTER_APIKEY not set` error on startup

**Solution:** Create `.env` file with required variables (see setup step 3).

### Issue: LLM provider returns errors

**Solution:** Check that at least one LLM API key is configured (see Environment Variables table).

## Debugging

Enable debug logging:

```bash
export DEBUG=1
uvicorn app.main:app --reload --log-level debug
```

Check service health:

```bash
curl http://localhost:8001/health
curl http://localhost:8001/health/llm
```

## TODO

- [x] Create web search capabilities with `SERPER`
- [x] Add LLM to generate structured data extraction
- [x] Store the data in embeddings in a `VectorDB`
- [x] Scrap the data using `Apify` paid.
- [ ] Need to find a free alternative for web scraping
- [ ] Add comprehensive test coverage
- [ ] Implement advanced caching strategies
