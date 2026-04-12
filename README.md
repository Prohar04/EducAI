# EducAI — AI-Powered Study Abroad Platform

> Smart university matching, scholarship hunting, and application planning — powered by real scraped data and AI reasoning.

[![CI/CD](https://github.com/Prohar04/EducAI/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Prohar04/EducAI/actions/workflows/ci-cd.yml)

---

## What It Does

EducAI helps international students navigate the study-abroad process end to end:

| Feature | Description |
|---------|-------------|
| **AI Program Match** | Scrapes university pages live via Firecrawl, ranks programmes against your profile with scored fit reasons |
| **Admission Requirement Analyzer** | Extracts GPA, English test, GRE/GMAT, deadlines, and documents from each programme |
| **Application Timeline Planner** | Month-by-month roadmap from saved deadlines + country-specific visa milestones |
| **Application Strategy Generator** | AI report with admission chance band, risk factors, and concrete next-step actions |
| **Scholarship Hunter** | Search and filter 28+ real-world scholarships with provider, amount, and eligibility data |
| **Funding Eligibility Checker** | Deterministic profile-aware scoring: eligible / partially eligible / not eligible |
| **Funding Probability Predictor** | 6-factor weighted score with strengths, weaknesses, and improvement actions |
| **Scholarship Deadline Alerts** | 30/14/7/1-day email alerts, idempotent DB deduplication, daily cron scheduler |
| **AI Advisor Chatbot** | Full-page conversational agent with profile context, source citations, and retry logic |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Browser (Next.js 16)                       │
│  /web · App Router · React 19 · Tailwind CSS 4 · shadcn/ui  │
└────────────────────┬────────────────────────────────────────┘
                     │  HTTPS / iron-session
┌────────────────────▼────────────────────────────────────────┐
│              Express API Server (Node 22)                   │
│  /server · Prisma 7 · Zod · Arcjet · JWT · Nodemailer       │
│  PostgreSQL via Neon serverless                             │
└──────────┬──────────────────────────────────────────────────┘
           │  Internal REST
┌──────────▼────────────────────┐    ┌────────────────────────┐
│    FastAPI AI Server           │    │  Neon PostgreSQL        │
│  /ai-server · Python 3.13      │    │  (Serverless Postgres)  │
│  OpenRouter · Gemini · Groq    │    └────────────────────────┘
│  Firecrawl scraping            │
│  Serper web search             │
└───────────────────────────────┘
```

| Service | Stack | Port |
|---------|-------|------|
| `web` | Next.js 16 · React 19 · TypeScript | 3000 |
| `server` | Express 5 · Prisma 7 · Node 22 · TypeScript | 8000 |
| `ai-server` | FastAPI · Python 3.13 · Pydantic | 8001 |
| Database | PostgreSQL via Neon serverless | — |

---

## Quick Start

### Prerequisites

- Node.js 22+
- Python 3.13+
- Docker (optional, for local Postgres)
- A [Neon](https://neon.tech) database URL (free tier works)

### 1. Clone and configure

```bash
git clone https://github.com/Prohar04/EducAI.git
cd EducAI

cp server/.env.example server/.env
cp web/.env.example web/.env.local
cp ai-server/.env.example ai-server/.env
```

### 2. Server

```bash
cd server
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run seed:scholarships   # seed 28 real-world scholarships
npm run seed:visa           # seed visa timeline templates (US, UK, CA, AU, DE)
npm run dev
```

### 3. AI server

```bash
cd ai-server
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### 4. Web

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Neon pooler connection string |
| `JWT_SECRET` | ✅ | 64-char random string for access tokens |
| `REFRESH_JWT_SECRET` | ✅ | 64-char random string for refresh tokens |
| `AI_SERVER_URL` | ✅ | FastAPI server URL (`http://localhost:8001`) |
| `ARCJET_KEY` | Recommended | Rate limiting and bot protection |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth |
| `EMAIL_PROVIDER` | Optional | `console` (dev, no SMTP) or `smtp` (production) |
| `EMAIL_USER` / `EMAIL_PASS` | Optional | Gmail address + App Password for alerts |
| `CRON_SECRET` | Recommended | Protects `POST /deadline-alerts/run` |
| `INGEST_API_KEY` | Optional | Shared key for match data ingestion from ai-server |

### Web (`web/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SESSION_SECRET_KEY` | ✅ | iron-session key (32+ chars: `openssl rand -base64 32`) |
| `BACKEND_URL` | ✅ | Express API URL |
| `JWT_SECRET` | ✅ | Must match server `JWT_SECRET` |

### AI Server (`ai-server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Recommended | LLM for chat and matching (free tier available) |
| `GEMINI_API_KEY` | Optional | LLM fallback (free tier available) |
| `GROQ_API_KEY` | Optional | Fast inference fallback (free tier available) |
| `SERPER_API_KEY` | Optional | Web search for chat citations |
| `FIRECRAWL_API_KEY` | Optional | Live university page scraping for program match |
| `INGEST_API_KEY` | Optional | Must match server `INGEST_API_KEY` |

> **No LLM key?** The ai-server falls back gracefully. Match still works from cached DB data; the chat advisor returns a clear "provider unavailable" message instead of crashing.

---

## Key Data Flows

### Program Match

```
User triggers match run
  → Express background worker
    → FastAPI /api/v1/module1/scrape-match
      → Serper web search + Firecrawl page scrape
      → LLM normalises programmes + calculates fit scores
    → Ingest normalised data into Neon (upsert)
    → Save MatchResult rows with score + fit reasons
  ← Polling returns results with fit band + reasons
```

### AI Chat Advisor

```
User sends message
  → Next.js /api/chat (adds session auth)
    → Express /chat
      → Load user context: profile + saved programs + match + timeline + strategy
      → FastAPI /api/v1/chat/answer
        → LLM with full user context + optional web search
        ← Structured reply: answer + bullets + source citations + confidence
```

### Scholarship Deadline Alerts

```
GitHub Actions cron (08:00 UTC daily)
  → POST /deadline-alerts/run (X-Cron-Secret auth)
    → Scan deadlines within 30 days across all users
    → For each (user × deadline × window) not yet logged:
      → Send email via Nodemailer (or log to console in dev)
      → Insert ScholarshipAlertLog record (unique constraint prevents duplicates)
```

---

## CI/CD

| Job | What it checks |
|-----|----------------|
| Server | `npm ci` → `prisma generate + validate` → lint → `tsc` → 62 Jest tests |
| Web | `npm ci` → lint → production build (31 routes) |
| AI Server | `pip install` → `ruff check` → pytest |
| Neon DB Migrate | TCP reachability check → `prisma migrate deploy` (skipped if Neon is paused, never fails the pipeline) |
| Docker Build | Builds all three service images |
| Deploy | Pushes to Docker Hub when `DOCKERHUB_USERNAME` secret is set |

### Required GitHub Secrets

| Secret | Purpose |
|--------|---------|
| `DATABASE_URL_CLOUD` | Auto-migration on push to main |
| `DOCKERHUB_USERNAME` / `DOCKERHUB_TOKEN` | Docker image push |
| `API_BASE_URL` + `CRON_SECRET` | Daily scholarship alert cron |

---

## Production Deployment (First Run)

```bash
cd server

# Apply migrations
npm run db:migrate:deploy

# Seed reference data (run once)
npm run seed:scholarships
npm run seed:visa
```

---

## Module Status

| Module | Feature | Status |
|--------|---------|--------|
| **Module 1** | AI Program Match | ✅ Complete |
| | Admission Requirement Analyzer | ✅ Complete |
| | Application Timeline Planner | ✅ Complete |
| | Application Strategy Generator | ✅ Complete |
| **Module 2** | Scholarship Hunter | ✅ Complete |
| | Funding Eligibility Checker | ✅ Complete |
| | Funding Probability Predictor | ✅ Complete |
| | Scholarship Deadline Alerts | ✅ Complete |
| **AI Chatbot** | AI Advisor | ✅ Complete |
| **Module 3** | SOP Builder | 🔜 Planned |
| | CV Builder | 🔜 Planned |
| | Professor Finder | 🔜 Planned |

---

## Authentication

- **Sign up** → email verification → sign in
- **Sign in** → JWT access + refresh tokens · optional "Remember Me" (30-day token) · 5-attempt lockout
- **Forgot password** → reset email link → new password
- **Google OAuth** → `/auth/google` redirect flow
- All protected routes require valid JWT; token refresh is transparent to the user

---

## Scholarship Data

Scholarship records are seeded from real public scholarship programmes (Fulbright, Chevening, DAAD, Erasmus+, etc.) with accurate descriptions, eligibility criteria, and deadlines. Each record includes:

- `sourceUrl` — link to the official scholarship page
- `lastVerified` — timestamp of last data verification
- `provider` / `countryCode` / `fundingType` — structured for filtering and matching

When `FIRECRAWL_API_KEY` is configured, the match pipeline can scrape live university and scholarship pages for up-to-date data.

> AI-generated eligibility and probability scores are labeled as AI reasoning, not guaranteed outcomes.

---

## Tech Highlights

- **Zero-downtime schema changes** — Prisma migrations with `prisma migrate deploy` in CI
- **Idempotent alert delivery** — unique DB constraint prevents duplicate alert emails across retries
- **Graceful Neon auto-pause handling** — CI migration step uses TCP reachability check and skips cleanly if the DB is paused
- **Profile-aware AI context** — every chat message carries the user's full academic profile, saved programs, match results, timeline, and strategy report
- **Background match worker** — scrape + rank + ingest runs async; frontend polls a lightweight status endpoint
