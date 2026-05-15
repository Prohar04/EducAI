# EducAI

[![CI/CD](https://github.com/Prohar04/EducAI/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Prohar04/EducAI/actions/workflows/ci-cd.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.13-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql&logoColor=white)](https://neon.tech)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-4A90D9.svg)](LICENSE)
[![Free](https://img.shields.io/badge/Pricing-Free%20forever-3D9970)](https://educai-web.vercel.app/pricing)

> **AI-Powered Study Abroad Platform** — guiding international students
> from profile setup to university acceptance with intelligent program
> matching, scholarship discovery, visa planning, document generation,
> career forecasting, and real-time job finding.

---

## Table of Contents

- [What is EducAI](#what-is-educai)
- [Live Demo](#live-demo)
- [Features](#features)
- [Job Finder](#job-finder)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Deployment](#deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Module Status](#module-status)
- [Authentication](#authentication)
- [Design System](#design-system)
- [Pricing](#pricing)
- [Legal](#legal)
- [Author](#author)

---

## What is EducAI

EducAI is a full-stack AI platform that guides international students
through every stage of the study abroad journey — from matching
universities and discovering scholarships, to building application
documents, forecasting career outcomes, and finding part-time or
full-time jobs abroad.

**Who it's for:** Undergraduate and postgraduate students targeting
international master's or PhD programs who need structured,
personalized guidance — not generic search results.

**What makes it different:**

A student goes from initial profile setup to a finished SOP,
ATS-ready CV, cold professor emails, a visa timeline, a career
outlook, and a curated job list — without leaving the platform.
Every AI result is clearly labeled. Eligibility scoring is
deterministic, not LLM-guessed. Job data refreshes every hour
from real job boards across 16+ countries.

---

## Live Demo

| Service | URL |
| :------- | :--- |
| **Frontend** (Vercel) | [educai-web.vercel.app](https://educai-web.vercel.app) |
| **Express API** (Render) | [educai-api-91ai.onrender.com](https://educai-api-91ai.onrender.com) |
| **AI Server** (Render) | [educai-ai-rd5y.onrender.com](https://educai-ai-rd5y.onrender.com) |
| **Database** | Neon PostgreSQL — serverless, ap-southeast-1 |

> **Free-tier note:** Render services spin down after inactivity.
> The first request after idle may take 30–60 seconds.

### Recommended Demo Flow

1. Sign up and complete onboarding (e.g. CS/AI · MSc · Canada + UK)
2. AI Program Match → Scholarships → Timeline → SOP → CV → Gap Fix
3. Career Outlook → Job Finder → Immigration Guide → AI Advisor Chat

---

## Features

### 🎓 Program Matching & Planning

| Feature | What it does |
| :------- | :----------- |
| **AI Program Match** | Scrapes live university pages via Firecrawl and ranks programs against your academic profile with scored fit reasons and admission bands |
| **Admission Requirement Analyzer** | Extracts GPA thresholds, English test cutoffs, GRE/GMAT requirements, and document checklists per program |
| **Application Timeline Planner** | Month-by-month roadmap from saved program deadlines with country-specific visa milestones for US, UK, CA, AU, and DE |
| **Application Strategy Generator** | LLM-generated report with admission chance band, risk factors, and a prioritized action plan |

### 💰 Scholarship & Funding

| Feature | What it does |
| :------- | :----------- |
| **Scholarship Hunter** | 28 real-world scholarships including Fulbright, Chevening, DAAD, and Erasmus+ with provider, amount, eligibility, and source links |
| **Funding Eligibility Checker** | Deterministic profile-aware eligibility scoring: eligible, partially eligible, or not eligible — with specific reasons |
| **Funding Probability Predictor** | 6-factor weighted probability score with strengths, weaknesses, and improvement steps |
| **Scholarship Deadline Alerts** | 30/14/7/1-day email alerts via daily cron with idempotent DB deduplication to prevent duplicate sends |

### 📄 Document & Profile Builders

| Feature | What it does |
| :------- | :----------- |
| **SOP Builder** | AI-generated Statement of Purpose across 3 tone modes and 3 SOP types, injected with full academic profile |
| **CV Builder** | ATS-friendly CV in academic, research, and industry styles, generated from profile data |
| **Professor Finder** | Live web search for research supervisors in the student's field and country, with cold-email templates |
| **Gap Fix Recommender** | AI profile gap analysis with competitiveness score, strengths/weaknesses inventory, and improvement roadmap |

### 🌍 Career, Immigration & Jobs

| Feature | What it does |
| :------- | :----------- |
| **Career Outcome Predictor** | Employability score, career pathways, salary ranges, key skills, and industry trends |
| **PR & Immigration Guide** | Step-by-step student visa, post-study work permit, and PR pathway per target country |
| **Job Finder** | Real-time job listings from Adzuna and JSearch — part-time while studying, internships, full-time after graduation, or remote |
| **AI Advisor Chatbot** | Floating assistant on every page with full profile context, source citations, and education-domain scope |
| **Education Pulse** | Daily curated news feed for international education, scholarships, and immigration updates |
| **Daily Motivation** | A new motivational quote every day, rotating deterministically so every user sees the same quote |

---

## Job Finder

The Job Finder uses a smart three-source cascade to deliver the
best available real-time job data for any country in the world.
Data is cached hourly via a GitHub Actions cron job.

### How the Cascade Works

| Priority | Source | Coverage | Quality |
| :------- | :----- | :------- | :------ |
| 1st | **Adzuna API** | 16 countries — official job board data | ⭐⭐⭐⭐⭐ Official |
| 2nd | **JSearch via RapidAPI** | All other countries — aggregates Indeed, LinkedIn, Glassdoor | ⭐⭐⭐⭐ Aggregated |
| 3rd | **OpenAI GPT-4o-mini** | Anywhere — last resort, clearly labeled as AI-generated | ⭐⭐⭐ AI-generated |

### Adzuna Countries (Source 1)

🇬🇧 UK · 🇺🇸 USA · 🇦🇺 Australia · 🇨🇦 Canada · 🇩🇪 Germany ·
🇫🇷 France · 🇮🇳 India · 🇵🇱 Poland · 🇷🇺 Russia · 🇿🇦 South Africa ·
🇧🇷 Brazil · 🇳🇱 Netherlands · 🇳🇿 New Zealand · 🇸🇬 Singapore ·
🇦🇹 Austria · 🇮🇹 Italy

### Job Finder API Setup

**Adzuna — free, 1,000 req/day:**

1. Register at <https://developer.adzuna.com>
2. Copy your App ID and App Key from the dashboard
3. Add `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` to `server/.env` and `ai-server/.env`

**JSearch via RapidAPI — free, 200 req/month:**

1. Sign up at <https://rapidapi.com>
2. Search "JSearch" by OpenWebNi and subscribe to the free plan
3. Go to Endpoints tab, copy the `X-RapidAPI-Key` value
4. Add as `RAPIDAPI_KEY` to `server/.env` and `ai-server/.env`

**OpenAI fallback:** No extra setup needed — uses the existing `OPENAI_API_KEY`.

### Behavior Without Keys

| Keys Configured | Behavior |
| :-------------- | :------- |
| Adzuna + JSearch + OpenAI | Full cascade — best data quality |
| Adzuna + OpenAI only | Adzuna for 16 countries, AI fallback elsewhere |
| JSearch + OpenAI only | JSearch for all countries, AI fallback on failure |
| OpenAI only | AI-generated listings everywhere, clearly labeled |
| None | Error message directing user to contact support |

---

## Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                    Browser (Next.js 16)                       │
│  App Router · React 19 · Tailwind CSS 4 · shadcn/ui          │
│  Profile-gated routes · iron-session · Framer Motion 12      │
│  Canvas 2D animations · BMW iX3 dark design system           │
└───────────────────────┬──────────────────────────────────────┘
                        │  HTTPS / JWT
┌───────────────────────▼──────────────────────────────────────┐
│              Express API (Node 22, TypeScript)                │
│  22 routers · 22 controllers · Prisma 7 · Zod 4             │
│  Nodemailer · Winston · JWT refresh · Google OAuth           │
│  Arcjet rate limiting · node-cache · PostgreSQL via Neon     │
└──────────────┬───────────────────────────────────────────────┘
               │  Internal REST (API-key auth)
┌──────────────▼────────────────────┐  ┌───────────────────────┐
│   FastAPI AI Server (Python 3.13) │  │   Neon PostgreSQL     │
│   chat · recommendations          │  │   30+ models          │
│   jobs · news · immigration       │  │   24+ migrations      │
│   scrape_match · strategy         │  └───────────────────────┘
│   OpenAI · Groq · OpenRouter      │
│   Gemini · Firecrawl · Serper     │
│   Adzuna · JSearch (RapidAPI)     │
└───────────────────────────────────┘
```

The Express API is the central orchestrator — it authenticates users,
manages data, and delegates all AI workloads to the FastAPI server.
The Next.js frontend never calls the AI server directly. Both services
are containerized and deployed separately on Render.

---

## Tech Stack

| Layer | Technology |
| :---- | :--------- |
| **Frontend** | Next.js 16.1 · React 19 · TypeScript 5 |
| **UI / Styling** | Tailwind CSS 4 · shadcn/ui · Radix UI · Framer Motion 12 |
| **Animations** | Canvas 2D API — star field, orbital rings, auth visual |
| **Express API** | Express 5 · Node 22 · TypeScript · Zod 4 |
| **AI Server** | FastAPI · Python 3.13 · Pydantic v2 |
| **ORM** | Prisma 7 (30+ models · 24+ migrations) |
| **Database** | PostgreSQL via Neon (serverless, ap-southeast-1) |
| **Auth** | iron-session · JWT / jose · Google OAuth (Passport.js) · Argon2 |
| **AI Providers** | OpenAI GPT-4o-mini (primary) · Groq · OpenRouter · Gemini |
| **Job Data** | Adzuna API · JSearch via RapidAPI |
| **Web Search** | Serper API |
| **Web Scraping** | Firecrawl |
| **Caching** | node-cache (server-side, TTL-based, 1-hour for jobs) |
| **Security** | Arcjet · Helmet · account lockout · rate limiting |
| **Email** | Nodemailer · Resend (production SMTP) |
| **Deployment** | Vercel · Render · Neon · Docker |
| **CI/CD** | GitHub Actions (6 jobs + 3 scheduled workflows) |

---

## Project Structure

```text
EducAI/
├── web/                              # Next.js 16 frontend
│   ├── app/
│   │   ├── (protected)/app/          # Profile-gated feature pages
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── programs/             # AI Program Match
│   │   │   ├── scholarships/         # Scholarship Hunter
│   │   │   ├── timeline/             # Application Timeline
│   │   │   ├── strategy/             # Strategy Generator
│   │   │   ├── sop/                  # SOP Builder
│   │   │   ├── cv/                   # CV Builder
│   │   │   ├── professors/           # Professor Finder
│   │   │   ├── gap-fix/              # Gap Fix Recommender
│   │   │   ├── career/               # Career Outcome Predictor
│   │   │   ├── jobs/                 # Job Finder
│   │   │   ├── immigration/          # PR & Immigration Guide
│   │   │   └── chat/                 # AI Advisor Chatbot
│   │   ├── auth/                     # Sign in, sign up, verify, reset
│   │   ├── onboarding/               # Multi-step onboarding wizard
│   │   ├── terms/                    # Terms of Service
│   │   ├── privacy/                  # Privacy Policy
│   │   └── api/                      # Next.js API handlers
│   ├── components/
│   │   ├── ui/                       # Design system primitives
│   │   │   ├── glass-card.tsx        # BMW iX3 glassmorphism card
│   │   │   ├── shimmer-button.tsx    # Animated CTA button
│   │   │   ├── star-field.tsx        # Canvas 2D star animation
│   │   │   ├── hero-visual.tsx       # Canvas 2D orbital rings
│   │   │   ├── auth-visual.tsx       # Canvas 2D education travel animation
│   │   │   ├── glow-orb.tsx          # BMW center glow effect
│   │   │   ├── gradient-text.tsx     # Gradient typography
│   │   │   ├── animated-counter.tsx  # Viewport-triggered number counter
│   │   │   ├── reveal-animation.tsx  # Scroll-triggered reveal
│   │   │   ├── daily-quote.tsx       # Daily motivational quote
│   │   │   └── education-news.tsx    # Live education news feed
│   │   ├── layout/                   # Sidebar, topbar, page transitions
│   │   ├── features/                 # Feature-specific components
│   │   └── shared/                   # Cross-feature shared components
│   └── lib/
│       ├── design-tokens.ts          # BMW iX3 inspired color palette
│       ├── hooks/                    # use-scroll-nav, use-canvas-size, etc.
│       └── utils/                    # format-date, format-salary, etc.
│
├── server/                           # Express 5 API (Node 22, TypeScript)
│   ├── src/
│   │   ├── routes/                   # 22 routers
│   │   ├── controllers/              # 22 controllers
│   │   └── services/                 # Business logic, email, LLM calls
│   └── prisma/
│       ├── schema.prisma             # 30+ models
│       ├── seedScholarships.ts       # 28 real-world scholarships
│       └── seedVisaTemplates.ts      # Visa milestones: US, UK, CA, AU, DE
│
├── ai-server/                        # FastAPI AI server (Python 3.13)
│   └── app/
│       ├── api/v1/
│       │   ├── jobs.py               # Job cascade: Adzuna → JSearch → OpenAI
│       │   ├── news.py               # Daily education news via Serper
│       │   ├── chat.py               # AI Advisor chatbot
│       │   └── recommendations.py    # Program matching
│       └── domains/
│           ├── jobs/
│           │   ├── adzuna.py         # Adzuna API client (16 countries)
│           │   ├── jsearch.py        # JSearch/RapidAPI client (global)
│           │   └── openai_fallback.py # GPT job generation (last resort)
│           ├── searching/            # Serper web search utilities
│           └── scraping/             # Firecrawl integration
│
├── .github/
│   └── workflows/
│       ├── ci-cd.yml                 # Main pipeline (6 jobs)
│       ├── scholarship-alerts.yml    # Daily 08:00 UTC
│       ├── data-sync.yml             # Daily 06:00 UTC
│       └── job-data-sync.yml         # Hourly job cache refresh
│
├── render.yaml                       # Render deployment blueprint
├── docker-compose.yml                # Local multi-service development
└── SETUP_SECRETS.md                  # GitHub Secrets and Render env guide
```

---

## Local Setup

### Prerequisites

- Node.js 22+
- Python 3.13+
- A [Neon](https://neon.tech) database URL (free tier works)
- Docker (optional)

### 1 — Clone and Configure

```bash
git clone https://github.com/Prohar04/EducAI.git
cd EducAI

cp server/.env.example server/.env
cp web/.env.example web/.env.local
cp ai-server/.env.example ai-server/.env
```

Edit each `.env` file with your credentials.
See [Environment Variables](#environment-variables) for details.

### 2 — Express API

```bash
cd server
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run seed:scholarships
npm run seed:visa
npm run dev
```

Starts on <http://localhost:8000>

### 3 — FastAPI AI Server

```bash
cd ai-server
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Starts on <http://localhost:8001>

### 4 — Next.js Frontend

```bash
cd web
npm install
npm run dev
```

Open <http://localhost:3000> and sign up to begin.

---

## Environment Variables

### `server/.env`

| Variable | Required | Description |
| :-------- | :------: | :---------- |
| `DATABASE_URL` | ✅ | Neon pooler connection string |
| `JWT_SECRET` | ✅ | 32+ character access token secret |
| `REFRESH_JWT_SECRET` | ✅ | 32+ character refresh token secret |
| `SESSION_SECRET` | ✅ | Express session secret |
| `AI_SERVER_URL` | ✅ | FastAPI base URL |
| `AI_SERVER_API_KEY` | ✅ | Shared secret with AI server |
| `ARCJET_KEY` | Recommended | Rate limiting and bot protection |
| `CRON_SECRET` | Recommended | Protects deadline alert cron endpoint |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |
| `EMAIL_HOST` | Optional | SMTP host (Resend in production) |
| `EMAIL_USER` | Optional | SMTP username |
| `EMAIL_PASS` | Optional | SMTP password |
| `ADZUNA_APP_ID` | Optional | Adzuna Job API — App ID |
| `ADZUNA_APP_KEY` | Optional | Adzuna Job API — App Key |
| `RAPIDAPI_KEY` | Optional | JSearch via RapidAPI — Job Finder fallback |

### `web/.env.local`

| Variable | Required | Description |
| :-------- | :------: | :---------- |
| `SESSION_SECRET_KEY` | ✅ | iron-session key (32+ chars) |
| `BACKEND_URL` | ✅ | Express API base URL |
| `JWT_SECRET` | ✅ | Must match server `JWT_SECRET` |

### `ai-server/.env`

| Variable | Required | Description |
| :-------- | :------: | :---------- |
| `MASTER_APIKEY` | ✅ | Must match `AI_SERVER_API_KEY` on Express server |
| `OPENAI_API_KEY` | Recommended | Primary LLM — GPT-4o-mini |
| `GROQ_API_KEY` | Optional | Free-tier LLM fallback |
| `OPENROUTER_API_KEY` | Optional | Secondary LLM fallback |
| `GEMINI_API_KEY` | Optional | Tertiary LLM fallback |
| `SERPER_API_KEY` | Optional | Web search — professor finder and news |
| `FIRECRAWL_API_KEY` | Optional | Live university page scraping |
| `ADZUNA_APP_ID` | Optional | Adzuna Job API — App ID |
| `ADZUNA_APP_KEY` | Optional | Adzuna Job API — App Key |
| `RAPIDAPI_KEY` | Optional | JSearch via RapidAPI — global job fallback |

> **No API keys?** All pages still load. AI features return clearly labeled
> fallback responses. The platform is transparent about what requires
> live credentials.

---

## Testing

```bash
# Express API
cd server && npm run lint && npm run build && npm test

# FastAPI AI Server
cd ai-server && ruff check . && pytest --tb=short -q

# Next.js
cd web && npm run lint && npm run build

# Prisma
cd server && npx prisma validate && npx prisma generate
```

---

## Deployment

| Layer | Platform | Notes |
| :---- | :------- | :---- |
| Frontend | [Vercel](https://vercel.com) | Auto-deploy on push to `main`, Singapore region |
| Express API | [Render](https://render.com) | `render.yaml` blueprint included |
| FastAPI AI Server | [Render](https://render.com) | Separate service in `render.yaml` |
| Database | [Neon](https://neon.tech) | Serverless PostgreSQL, free tier |

### Health Endpoints

| Endpoint | Purpose |
| :-------- | :------- |
| `GET /health` | Express API liveness |
| `GET /health/db` | Database connectivity check |
| `GET /api/v1/health` | AI server liveness |
| `GET /api/v1/health/llm` | LLM provider connection status |

### First Production Deploy

```bash
cd server
npm run db:migrate:deploy
npm run seed:scholarships
npm run seed:visa
```

Import `render.yaml` in the Render dashboard to create both backend
services with pre-configured environment variables and health check paths.

### Required GitHub Secrets

Add these in **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Used by |
| :----- | :------ |
| `DATABASE_URL` | Neon DB Migrate job |
| `JWT_SECRET` | Server and Web jobs |
| `AI_SERVER_API_KEY` | Server and AI Server jobs |
| `OPENAI_API_KEY` | AI Server — primary LLM |
| `CRON_SECRET` | Scholarship alerts workflow |
| `ADZUNA_APP_ID` | Job Finder Source 1 (optional) |
| `ADZUNA_APP_KEY` | Job Finder Source 1 (optional) |
| `RAPIDAPI_KEY` | Job Finder Source 2 (optional) |
| `DOCKERHUB_USERNAME` | Docker Build and Deploy jobs |
| `DOCKERHUB_TOKEN` | Docker Build and Deploy jobs |

See `SETUP_SECRETS.md` for the complete setup guide.

---

## CI/CD Pipeline

### `ci-cd.yml` — triggers on push to `main` or `develop`

| Job | What it checks |
| :-- | :------------- |
| **Server** | `npm ci` → `prisma generate + validate` → lint → tsc → Jest |
| **Web** | `npm ci` → lint → production build |
| **AI Server** | `pip install` → `ruff check` → pytest |
| **DB Migrate** | TCP check → `prisma migrate deploy` (graceful skip if Neon is paused) |
| **Docker Build** | Builds all three service images with layer caching |
| **Deploy** | Pushes to Docker Hub when secrets are configured |

### Scheduled Workflows

| Workflow | Schedule | Purpose |
| :-------- | :------- | :------ |
| `scholarship-alerts.yml` | Daily 08:00 UTC | Sends scholarship deadline email alerts |
| `data-sync.yml` | Daily 06:00 UTC | Refreshes program and scholarship data |
| `job-data-sync.yml` | Every hour | Refreshes job listing cache for active searches |

---

## Module Status

| Module | Feature | Status |
| :----- | :------ | :----: |
| **Matching** | AI Program Match | ✅ |
| **Matching** | Admission Requirement Analyzer | ✅ |
| **Matching** | Application Timeline Planner | ✅ |
| **Matching** | Application Strategy Generator | ✅ |
| **Funding** | Scholarship Hunter (28 records) | ✅ |
| **Funding** | Funding Eligibility Checker | ✅ |
| **Funding** | Funding Probability Predictor | ✅ |
| **Funding** | Scholarship Deadline Alerts | ✅ |
| **Documents** | SOP Builder | ✅ |
| **Documents** | CV Builder | ✅ |
| **Documents** | Resume Builder | ✅ |
| **Documents** | Professor Finder | ✅ |
| **Documents** | Gap Fix Recommender | ✅ |
| **Career** | Career Outcome Predictor | ✅ |
| **Career** | PR & Immigration Guide | ✅ |
| **Career** | Job Finder (Adzuna + JSearch) | ✅ |
| **Career** | AI Advisor Chatbot | ✅ |
| **Content** | Education Pulse (daily news) | ✅ |
| **Content** | Daily Motivational Quote | ✅ |
| **Account** | GDPR data export (`GET /auth/export-data`) | ✅ |
| **Account** | Self-service account deletion | ✅ |
| **Account** | Welcome email on verification | ✅ |
| **Legal** | Terms of Service | ✅ |
| **Legal** | Privacy Policy | ✅ |
| **Legal** | Pricing page | ✅ |

---

## Authentication

- **Sign up** → email verification → welcome email → sign in
- **Sign in** → JWT access token (15 min) + refresh token (15 days)
- **Remember Me** → optional 30-day session extension
- **Google OAuth** → Passport.js redirect flow → account link or creation
- **Security** → 5-attempt lockout · Argon2 password hashing · Arcjet rate limiting on all auth routes · bot protection
- **Profile gating** → all platform features require completed onboarding
- **Account management** → self-service deletion with cascade + GDPR JSON data export
- Sessions managed with iron-session on the Next.js side and raw JWTs on the Express API side

---

## Design System

EducAI uses a BMW iX3 inspired dark design system — restrained,
confident, and premium. One accent color. Depth through layering.

| Token | Value | Usage |
| :---- | :---- | :---- |
| Base background | `#080D18` | Deep navy — body, pages |
| Surface | `#0D1625` | Card backgrounds |
| Primary accent | `#4A90D9` | Muted steel blue — buttons, icons, links |
| Primary text | `#E8EEF8` | Cool white with blue tint |
| Secondary text | `#7A8BA8` | Blue-gray muted body text |
| Success | `#3D9970` | Muted sage green — eligible, passed |
| Warning | `#C49A3C` | Muted gold — partial, pending |
| Error | `#C0392B` | Deep muted red — failed, not eligible |

**Animations** use Canvas 2D API exclusively — no WebGL, no Three.js, no crashes:

- `star-field.tsx` — 20fps twinkling star background
- `hero-visual.tsx` — 30fps orbital rings with comet trails
- `auth-visual.tsx` — 30fps airplane + graduation caps + city dots + globe

**Performance targets:**

- First Load JS under 200KB per route
- Canvas animations throttled to 20–30fps
- `backdrop-filter` reduced to `blur(8px)` maximum
- `background-attachment: fixed` replaced with `::before` pseudo-element
- All scroll listeners use `{ passive: true }`

---

## Pricing

EducAI is **free forever**. All core features — program matching, scholarship
discovery, AI strategy, SOP/CV builder, job finder, gap fix, timeline planner,
immigration guide, and chatbot — are available at no cost with no credit card
required.

A Pro tier with priority AI processing and advanced features is planned for the
future. The free tier will always remain fully functional.

→ [educai-web.vercel.app/pricing](https://educai-web.vercel.app/pricing)

---

## Legal

- **Terms of Service** — <https://educai-web.vercel.app/terms>
- **Privacy Policy** — <https://educai-web.vercel.app/privacy>
- **Pricing** — <https://educai-web.vercel.app/pricing>
- **Contact** — [support.educai@gmail.com](mailto:support.educai@gmail.com)
- **Effective date** — February 1, 2026
- **Last updated** — May 2026

EducAI is GDPR-aware and CCPA-aware. Users can export or permanently delete
their data at any time from Profile → Settings. We do not sell user data.
We do not use advertising cookies or third-party tracking pixels.

---

## Author

### Prohar Saha Polak

- GitHub: [github.com/Prohar04](https://github.com/Prohar04)
- Email: [support.educai@gmail.com](mailto:support.educai@gmail.com)
- Project started: February 2026

---

Built with [Next.js](https://nextjs.org) · [FastAPI](https://fastapi.tiangolo.com) · [Prisma](https://prisma.io) · [Neon](https://neon.tech) · [Vercel](https://vercel.com) · [Render](https://render.com)

*© 2026 EducAI. Released under the MIT License.*
