<div align="center">

# EducAI

### AI-Powered Study Abroad Guidance Platform

**From profile to acceptance — intelligent program matching, scholarship discovery, application planning, document generation, and career forecasting for international students.**

[![CI/CD](https://github.com/Prohar04/EducAI/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Prohar04/EducAI/actions/workflows/ci-cd.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.13-009688?logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-00C7B7?logo=postgresql)
![License](https://img.shields.io/badge/license-TBD-lightgrey)

</div>

---

## Overview

EducAI is a full-stack AI platform that guides international students through every stage of the study abroad journey — from matching universities and discovering scholarships, to building application documents and forecasting career outcomes.

Rather than a static database, EducAI combines live web scraping, LLM reasoning chains, and deterministic scoring algorithms to give students personalized, actionable intelligence across four integrated modules.

**Who it is for:** Undergraduate and postgraduate students targeting international master's or PhD programs who need structured, personalized guidance — not generic information from a search engine.

**What makes it different:** A student can go from initial profile setup to a finished SOP, ATS-ready CV, cold professor emails, a visa timeline, and a career outlook without leaving the platform. Every AI result is clearly labeled, and eligibility scoring is deterministic — not LLM-guessed.

---

## Live Demo

| Service | URL |
|---|---|
| **Frontend** (Vercel) | [educai-web.vercel.app](https://educai-web.vercel.app/) |
| **Express API** (Render) | [educai-api-91ai.onrender.com](https://educai-api-91ai.onrender.com) |
| **AI Server** (Render) | [educai-ai-rd5y.onrender.com](https://educai-ai-rd5y.onrender.com) |
| **Database** | Neon PostgreSQL (serverless, ap-southeast-1) |
| **Demo Video** | `[Add demo video link here]` |

> **Free-tier note:** Render services spin down after inactivity. The first request after idle may take 30–60 seconds to wake. Email auth (Resend) and Google OAuth are not configured in this deployment — email/password sign-up and sign-in work normally.

**Recommended demo flow:**

1. Sign up at [educai-web.vercel.app/auth/signup](https://educai-web.vercel.app/auth/signup)
2. Complete onboarding (e.g. CS/AI · MSc · Canada + UK targets)
3. AI Program Match → Scholarships → Timeline → SOP → CV → Gap Fix → Career → Chat

---

## Key Features

### Module 1 — Program Matching & Planning

| Feature | Description |
|---|---|
| **AI Program Match** | Scrapes live university pages via Firecrawl, ranks programs against the student's academic profile with scored fit reasons and admission bands |
| **Admission Requirement Analyzer** | Extracts GPA thresholds, English test requirements, GRE/GMAT, application deadlines, and document checklists from each program page |
| **Application Timeline Planner** | Generates a month-by-month roadmap from saved program deadlines, integrated with country-specific visa milestones (US, UK, CA, AU, DE) |
| **Application Strategy Generator** | LLM-generated report with admission chance band, risk factors, and a prioritized action plan for each saved program |

### Module 2 — Scholarship & Funding

| Feature | Description |
|---|---|
| **Scholarship Hunter** | Search and filter 28 real-world scholarships (Fulbright, Chevening, DAAD, Erasmus+, and more) with provider, amount, eligibility criteria, and source links |
| **Funding Eligibility Checker** | Deterministic profile-aware eligibility scoring: eligible / partially eligible / not eligible, with specific reasons per scholarship |
| **Funding Probability Predictor** | 6-factor weighted probability score with identified strengths, weaknesses, and concrete improvement steps |
| **Scholarship Deadline Alerts** | 30/14/7/1-day email alerts via a daily cron job; idempotent DB deduplication prevents duplicate sends |

### Module 3 — Document & Profile Builders

| Feature | Description |
|---|---|
| **SOP Builder** | AI-generated Statement of Purpose across 3 tone modes (formal, research, personal) and 3 SOP types, injected with the student's full academic profile |
| **CV Builder** | ATS-friendly CV in academic, research, and industry styles, generated directly from profile data |
| **Professor Finder** | Live web search for research supervisors in the student's field and target country, with auto-generated cold-email templates |
| **Gap Fix Recommender** | AI profile gap analysis — competitiveness score, strengths and weaknesses inventory, and a prioritized improvement roadmap |

### Module 4 — Career & Immigration Intelligence

| Feature | Description |
|---|---|
| **Career Outcome Predictor** | Employability score, career pathways, salary ranges, key skills to develop, and industry trends for the student's field and target country |
| **PR & Immigration Guide** | Step-by-step study visa, post-study work permit, and PR pathway guide per target country with advantages and pitfalls |
| **AI Advisor Chatbot** | Floating assistant on every protected page — full profile context, source citations, and retry logic |
| **Education Pulse** | Curated RSS-sourced news feed for international education, scholarships, and immigration policy updates |
| **Data Sync Agent** | Manual and scheduled data refresh pipeline for programs and scholarships, with full run history and status monitoring |

---

## User Flow

```
Onboarding → Profile Setup → AI Program Match → Browse & Save Programs
       ↓
Scholarship Discovery → Eligibility Check → Deadline Alerts
       ↓
Application Timeline → Strategy Report → SOP + CV Generation
       ↓
Professor Finder → Gap Fix Analysis → Career Outlook → Immigration Guide
       ↓
AI Chatbot (available throughout) · Education Pulse (news sidebar)
```

1. **Onboarding** — enter academic background, target countries, intended program level, and intake year.
2. **Profile setup** — fill in GPA, English test scores, research experience, and work history.
3. **AI program match** — trigger a match run; the system scrapes live university pages, ranks programs, and returns fit scores with reasons.
4. **Scholarships** — search and filter scholarships; check per-scholarship eligibility against your profile.
5. **Application planning** — save programs, generate a month-by-month timeline with visa milestones, and get a full AI strategy report.
6. **Document tools** — generate SOP, CV, cold professor emails, and a gap fix roadmap.
7. **Career & immigration** — see employability predictions and step-by-step immigration pathways for your target countries.
8. **AI chatbot** — ask anything: "What are my chances for Chevening?", "Compare my profile to the Waterloo CS requirements."

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16.1 · React 19 · TypeScript 5 |
| **UI / Styling** | Tailwind CSS 4 · shadcn/ui · Radix UI · Framer Motion 12 |
| **Express API** | Express 5 · Node 22 · TypeScript · Zod 4 |
| **AI Server** | FastAPI · Python 3.13 · Pydantic v2 |
| **ORM** | Prisma 7 (28 models · 22 migrations) |
| **Database** | PostgreSQL via Neon (serverless) |
| **Auth** | iron-session · JWT / jose · Google OAuth (Passport.js) · Argon2 |
| **AI Providers** | OpenAI GPT-4o-mini (primary) · Groq · OpenRouter · Gemini (fallbacks) |
| **Web Scraping** | Firecrawl |
| **Web Search** | Serper API |
| **Security** | Arcjet (rate limiting + bot protection) · Helmet · account lockout |
| **Email** | Nodemailer · Resend (production SMTP) |
| **Logging** | Winston (Express) · Loguru (FastAPI) |
| **Deployment** | Vercel · Render · Neon · Docker |
| **CI/CD** | GitHub Actions (6 jobs: server, web, ai-server, migrate, docker-build, deploy) |

---

## Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                     Browser (Next.js 16)                          │
│   App Router · React 19 · Tailwind CSS · shadcn/ui                │
│   27 pages · 6 API handlers · iron-session                        │
└────────────────────────┬──────────────────────────────────────────┘
                         │  HTTPS / JWT
┌────────────────────────▼──────────────────────────────────────────┐
│                  Express API (Node 22)                             │
│   20 routers · 20 controllers · Prisma 7 · Zod · Arcjet           │
│   Nodemailer · Winston · JWT refresh · Google OAuth               │
│   PostgreSQL via Neon serverless                                   │
└───────────────┬───────────────────────────────────────────────────┘
                │  Internal REST (API-key auth)
┌───────────────▼──────────────────┐   ┌───────────────────────────┐
│  FastAPI AI Server (Python 3.13) │   │  Neon PostgreSQL           │
│  6 route modules:                │   │  (Serverless Postgres)     │
│  · health · chat · recommendations│  │  28 models · 22 migrations │
│  · module1_sync · scrape_match   │   └───────────────────────────┘
│  · strategy                      │
│  OpenAI · Groq · OpenRouter      │
│  Firecrawl · Serper              │
└──────────────────────────────────┘
```

The Express API is the central orchestrator — it authenticates users, manages data, and delegates all AI workloads to the FastAPI server. The Next.js frontend communicates only with the Express API; it never calls the AI server directly. The AI server is stateless and can be scaled independently. Both services are containerized with Docker and deployed separately on Render.

---

## Project Structure

```
EducAI/
├── web/                        # Next.js 16 frontend (App Router)
│   ├── app/
│   │   ├── (protected)/app/    # 19 protected pages (match, scholarships, sop, cv …)
│   │   ├── auth/               # 5 auth pages (signin, signup, verify, reset …)
│   │   ├── onboarding/         # Multi-step onboarding flow
│   │   └── api/                # 6 Next.js API handlers (chat, OAuth, signout …)
│   ├── components/             # Shared UI (app, auth, home, motion, theme)
│   ├── lib/                    # Auth helpers, server actions, data fetchers
│   └── providers/              # Theme provider
│
├── server/                     # Express 5 API (Node 22, TypeScript)
│   ├── src/
│   │   ├── routes/             # 20 routers (auth, match, scholarships, timeline …)
│   │   ├── controllers/        # 20 controllers
│   │   ├── services/           # Business logic (email, session, tokens, LLM calls …)
│   │   └── middlewares/        # Auth, rate limiting, validation
│   ├── prisma/
│   │   ├── schema.prisma       # 28 models, 589 lines
│   │   ├── migrations/         # 22 migrations
│   │   ├── seed.ts             # Base seed
│   │   ├── seedScholarships.ts # 28 real-world scholarships
│   │   └── seedVisaTemplates.ts# Visa milestones: US, UK, CA, AU, DE
│   └── tests/                  # Jest tests across 5 suites
│
├── ai-server/                  # FastAPI AI server (Python 3.13)
│   └── app/
│       ├── api/v1/             # health · chat · recommendations · module1_sync · scrape_match · strategy
│       ├── domains/            # reasoning · scraping · searching · embeddings · ingestion
│       ├── LLM/                # Provider abstraction (OpenAI, Groq, OpenRouter, Gemini)
│       └── schemas/            # Pydantic request/response models
│
├── docs/                       # Deployment guides, live URLs, architecture notes
├── scripts/                    # Utility scripts
├── .github/workflows/          # CI/CD, scholarship alerts, data sync (3 workflows)
├── render.yaml                 # Render deployment blueprint (2 services)
└── docker-compose.yml          # Local multi-service development
```

---

## Local Setup

### Prerequisites

- Node.js 22+
- Python 3.13+
- A [Neon](https://neon.tech) database URL (free tier works)
- Docker (optional — for local Postgres instead of Neon)

### 1. Clone and configure

```bash
git clone https://github.com/Prohar04/EducAI.git
cd EducAI

cp server/.env.example server/.env
cp web/.env.example web/.env.local
cp ai-server/.env.example ai-server/.env
```

### 2. Express API

```bash
cd server
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run seed:scholarships   # seeds 28 real-world scholarships
npm run seed:visa           # seeds visa timeline templates
npm run dev                 # starts on :8000
```

### 3. FastAPI AI Server

```bash
cd ai-server
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### 4. Next.js Frontend

```bash
cd web
npm install
npm run dev                    # starts on :3000
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

### Server — `server/.env`

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon pooler connection string |
| `JWT_SECRET` | ✅ | 32+ char random string for access tokens |
| `REFRESH_JWT_SECRET` | ✅ | 32+ char random string for refresh tokens (different value) |
| `SESSION_SECRET` | ✅ | Express session secret |
| `AI_SERVER_URL` | ✅ | FastAPI server base URL (e.g. `http://localhost:8001`) |
| `AI_SERVER_API_KEY` | ✅ | Shared secret between Express and AI server |
| `ARCJET_KEY` | Recommended | Rate limiting and bot protection |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth |
| `GOOGLE_CALLBACK_URL` | Optional | OAuth redirect URL |
| `EMAIL_HOST` / `EMAIL_USER` / `EMAIL_PASS` | Optional | SMTP — use Resend in production |
| `CRON_SECRET` | Recommended | Protects `POST /deadline-alerts/run` |
| `OPENAI_API_KEY` | Recommended | Direct LLM fallback on Express side |
| `SERPER_API_KEY` | Recommended | Professor Finder and intelligent search |

### Web — `web/.env.local`

| Variable | Required | Description |
|---|---|---|
| `SESSION_SECRET_KEY` | ✅ | iron-session encryption key (32+ chars) |
| `BACKEND_URL` | ✅ | Express API base URL |
| `JWT_SECRET` | ✅ | Must match `server` JWT_SECRET |

### AI Server — `ai-server/.env`

| Variable | Required | Description |
|---|---|---|
| `MASTER_APIKEY` | ✅ | Must match `AI_SERVER_API_KEY` on the Express server |
| `OPENAI_API_KEY` | Recommended | Primary LLM — GPT-4o-mini |
| `GROQ_API_KEY` | Optional | Free-tier LLM fallback |
| `OPENROUTER_API_KEY` | Optional | Secondary LLM fallback |
| `GEMINI_API_KEY` | Optional | Tertiary LLM fallback |
| `LLM_PROVIDER` | Optional | Override active provider: `openai \| groq \| openrouter \| gemini` |
| `SERPER_API_KEY` | Optional | Web search for professor discovery and citations |
| `FIRECRAWL_API_KEY` | Optional | Live university page scraping for program match |
| `CHROMADB_HOST` / `CHROMADB_PORT` | Optional | Vector search (disabled on Render free tier) |

> **No API keys?** All pages still load. AI features return structured fallback responses clearly labeled as guidance. The product is transparent about what requires live provider credentials.

---

## Testing & Validation

```bash
# Express API — lint, build, and test
cd server
npm run lint
npm run build
npm test

# Prisma
npx prisma validate
npx prisma generate

# FastAPI AI Server — lint and test
cd ai-server
ruff check .
pytest --tb=short -q

# Next.js — lint and production build
cd web
npm run lint
npm run build
```

---

## Deployment

| Layer | Platform | Notes |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Auto-deploy on push to `main` |
| Express API | [Render](https://render.com) | `render.yaml` blueprint included |
| FastAPI AI Server | [Render](https://render.com) | Separate service in `render.yaml` |
| Database | [Neon](https://neon.tech) | Serverless PostgreSQL, free tier |

### Health Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /health` | Express API liveness |
| `GET /health/db` | DB connectivity check |
| `GET /api/v1/health` | AI server liveness |
| `GET /api/v1/health/llm` | LLM provider status |

### First Deploy

```bash
cd server

# Apply all migrations to production DB
npm run db:migrate:deploy

# Seed reference data (run once)
npm run seed:scholarships
npm run seed:visa
```

A `render.yaml` blueprint is included at the repo root — import it in the Render dashboard to create both backend services with pre-configured environment variable placeholders and health check paths.

---

## CI/CD Pipeline

Three GitHub Actions workflows run automatically:

**`ci-cd.yml`** — triggered on push to `main` or `develop`:

| Job | What It Checks |
|---|---|
| **Server** | `npm ci` → `prisma generate + validate` → lint → `tsc` → Jest tests |
| **Web** | `npm ci` → lint → production build (27 pages · 6 API handlers) |
| **AI Server** | `pip install` → `ruff check` → pytest |
| **DB Migrate** | TCP reachability → `prisma migrate deploy` (gracefully skipped if Neon is paused) |
| **Docker Build** | Builds all three service images with layer caching |
| **Deploy** | Pushes to Docker Hub when `DOCKERHUB_USERNAME` secret is configured |

**`scholarship-alerts.yml`** — daily at 08:00 UTC, triggers `POST /deadline-alerts/run`.

**`data-sync.yml`** — daily at 06:00 UTC, triggers program and scholarship data refresh.

### Required GitHub Secrets

| Secret | Purpose |
|---|---|
| `DATABASE_URL_CLOUD` | Auto-migration on push to `main` |
| `DOCKERHUB_USERNAME` / `DOCKERHUB_TOKEN` | Docker image push |
| `API_BASE_URL` + `CRON_SECRET` | Daily scholarship deadline alert cron |

---

## Module Status

| Module | Feature | Status |
|---|---|---|
| **Module 1** | AI Program Match | ✅ Complete |
| | Admission Requirement Analyzer | ✅ Complete |
| | Application Timeline Planner | ✅ Complete |
| | Application Strategy Generator | ✅ Complete |
| **Module 2** | Scholarship Hunter (28 real records) | ✅ Complete |
| | Funding Eligibility Checker | ✅ Complete |
| | Funding Probability Predictor | ✅ Complete |
| | Scholarship Deadline Alerts | ✅ Complete |
| **Module 3** | SOP Builder | ✅ Complete |
| | CV Builder | ✅ Complete |
| | Professor Finder | ✅ Complete |
| | Gap Fix Recommender | ✅ Complete |
| **Module 4** | Career Outcome Predictor | ✅ Complete |
| | PR & Immigration Guide | ✅ Complete |
| | Education Pulse (news feed) | ✅ Complete |
| | AI Advisor Chatbot | ✅ Complete |
| | Data Sync Agent | ✅ Complete |

**Known free-tier limitations:** Render services spin down after inactivity — cold starts can add 30–60 seconds on the first request. Neon databases auto-pause; the CI migration step handles this gracefully without failing the pipeline. Google OAuth and email alerts are not configured in the live demo deployment.

---

## Authentication

- **Sign up** → email verification → sign in
- **Sign in** → JWT access token (15 min) + refresh token (15 days) · optional 30-day "Remember Me" · 5-attempt lockout with timed reset
- **Forgot password** → reset email link (Resend) → new password
- **Google OAuth** → Passport.js redirect flow → account link or creation
- All protected routes require a valid JWT; token refresh is transparent to the user
- Sessions managed with iron-session on the Next.js side; raw JWTs on the Express API side

---

## Why EducAI Stands Out

Most university search tools are static databases. EducAI is a reasoning platform:

- **Live data** — Firecrawl scrapes real university pages at match time; scholarship records include `sourceUrl` and `lastVerified` timestamps linked to official sources.
- **Profile-aware intelligence** — every AI call receives the student's full academic context: GPA, test scores, research experience, target countries, and saved programs.
- **End-to-end coverage** — a student can go from profile setup to a ready-to-submit SOP, CV, cold professor email, and visa roadmap without leaving the platform.
- **Honest AI** — eligibility scores are deterministic (not LLM-guessed), probability predictions expose their inputs, and AI-generated content is clearly labeled.
- **Production engineering** — idempotent alert delivery, Arcjet bot protection, JWT + refresh token auth with account lockout, graceful Neon auto-pause handling in CI, and a full Docker + Render deployment blueprint.

---

## Future Improvements

- **RAG over program documents** — embed and chunk official program PDFs for higher-precision requirement extraction using ChromaDB (infrastructure already scaffolded)
- **Side-by-side program comparison** — comparison table across all match dimensions for saved programs
- **Application tracker** — Kanban-style board to track application status per program
- **Reference letter tools** — AI-assisted reference request templates and tracking
- **Community Q&A** — peer discussions and alumni insights per university and program
- **Mobile app** — React Native client with push notifications for deadline alerts
- **Fine-tuned models** — domain-specific fine-tuning for SOP scoring and eligibility prediction

---

## Author

**Prohar Saha Polak**

| | |
|---|---|
| GitHub | [github.com/Prohar04](https://github.com/Prohar04) |
| LinkedIn | `[Add LinkedIn URL here]` |
| Email | sahaprohar10@gmail.com |

---

<div align="center">

Built with [Next.js](https://nextjs.org), [FastAPI](https://fastapi.tiangolo.com), [Prisma](https://www.prisma.io), and [Neon](https://neon.tech).

</div>
