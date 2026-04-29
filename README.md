<div align="center">

<img src="https://img.shields.io/badge/EducAI-Study%20Abroad%20Intelligence-6366f1?style=for-the-badge" alt="EducAI" />

### AI-Powered Study Abroad Platform

**From profile setup to acceptance — intelligent program matching, scholarship discovery, visa planning, document generation, and career forecasting for international students.**

<br/>

[![CI/CD](https://github.com/Prohar04/EducAI/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Prohar04/EducAI/actions/workflows/ci-cd.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.13-009688?logo=fastapi&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)

</div>

---

## What is EducAI?

EducAI is a full-stack AI platform that guides international students through every stage of the study abroad journey — from matching universities and discovering scholarships, to building application documents and forecasting career outcomes.

**Who it's for:** Undergraduate and postgraduate students targeting international master's or PhD programs who need structured, personalized guidance — not generic search results.

**What makes it different:** A student goes from initial profile setup to a finished SOP, ATS-ready CV, cold professor emails, a visa timeline, and a career outlook without leaving the platform. Every AI result is clearly labeled. Eligibility scoring is deterministic, not LLM-guessed.

---

## 🚀 Live Demo

| Service | URL |
|:--------|:----|
| **Frontend** (Vercel) | [educai-web.vercel.app](https://educai-web.vercel.app/) |
| **Express API** (Render) | [educai-api-91ai.onrender.com](https://educai-api-91ai.onrender.com) |
| **AI Server** (Render) | [educai-ai-rd5y.onrender.com](https://educai-ai-rd5y.onrender.com) |
| **Database** | Neon PostgreSQL — serverless, ap-southeast-1 |
| **Demo Video** | `[Add demo video link]` |

> **Free-tier note:** Render services spin down after inactivity. The first request after idle may take 30–60 seconds. Email auth and Google OAuth are not configured in the demo deployment — email/password sign-up works normally.

**Recommended demo flow:**
1. Sign up → complete onboarding (e.g. CS/AI · MSc · Canada + UK)
2. AI Program Match → Scholarships → Timeline → SOP → CV → Gap Fix → Career → Chat

---

## ✨ Features

### 🎓 Program Matching & Planning

| Feature | What it does |
|:--------|:------------|
| **AI Program Match** | Scrapes live university pages via Firecrawl; ranks programs against academic profile with scored fit reasons and admission bands |
| **Admission Requirement Analyzer** | Extracts GPA thresholds, English test cutoffs, GRE/GMAT requirements, and document checklists per program |
| **Application Timeline Planner** | Month-by-month roadmap from saved program deadlines, integrated with country-specific visa milestones (US, UK, CA, AU, DE) |
| **Application Strategy Generator** | LLM-generated report: admission chance band, risk factors, and prioritized action plan |

### 💰 Scholarship & Funding

| Feature | What it does |
|:--------|:------------|
| **Scholarship Hunter** | 28 real-world scholarships (Fulbright, Chevening, DAAD, Erasmus+) with provider, amount, eligibility, and source links |
| **Funding Eligibility Checker** | Deterministic profile-aware eligibility scoring: eligible / partially / not eligible, with specific reasons |
| **Funding Probability Predictor** | 6-factor weighted probability score with strengths, weaknesses, and improvement steps |
| **Scholarship Deadline Alerts** | 30/14/7/1-day email alerts via daily cron; idempotent DB deduplication prevents duplicate sends |

### 📄 Document & Profile Builders

| Feature | What it does |
|:--------|:------------|
| **SOP Builder** | AI-generated Statement of Purpose across 3 tone modes and 3 SOP types, injected with full academic profile |
| **CV Builder** | ATS-friendly CV in academic, research, and industry styles, generated from profile data |
| **Professor Finder** | Live web search for research supervisors in the student's field and country, with cold-email templates |
| **Gap Fix Recommender** | AI profile gap analysis: competitiveness score, strengths/weaknesses inventory, and improvement roadmap |

### 🌍 Career & Immigration

| Feature | What it does |
|:--------|:------------|
| **Career Outcome Predictor** | Employability score, career pathways, salary ranges, key skills, and industry trends |
| **PR & Immigration Guide** | Step-by-step student visa, post-study work permit, and PR pathway per target country |
| **AI Advisor Chatbot** | Floating assistant on every page — full profile context, source citations, education-domain scoped |
| **Education Pulse** | RSS-sourced news feed for international education, scholarships, and immigration updates |
| **Data Freshness** | Manual and scheduled data refresh pipeline — keep program and scholarship data current |

---

## 🗺️ User Flow

```
Sign Up → Onboarding → Profile Setup
    ↓
AI Program Match → Browse & Save Programs → Admission Requirement Check
    ↓
Scholarship Discovery → Eligibility Check → Deadline Alerts
    ↓
Application Timeline → Strategy Report → SOP + CV Generation
    ↓
Professor Finder → Gap Fix Analysis → Career Outlook → Immigration Guide
    ↓
AI Advisor Chatbot (available throughout) · Education Pulse (news sidebar)
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (Next.js 16)                        │
│  App Router · React 19 · Tailwind CSS 4 · shadcn/ui             │
│  Profile-gated protected routes · iron-session auth             │
└───────────────────────┬─────────────────────────────────────────┘
                        │  HTTPS / JWT
┌───────────────────────▼─────────────────────────────────────────┐
│                  Express API (Node 22)                           │
│  20 routers · 20 controllers · Prisma 7 · Zod · Arcjet          │
│  Nodemailer · Winston · JWT refresh · Google OAuth              │
│  PostgreSQL via Neon serverless                                  │
└──────────────┬──────────────────────────────────────────────────┘
               │  Internal REST (API-key auth)
┌──────────────▼──────────────────────┐  ┌────────────────────────┐
│  FastAPI AI Server (Python 3.13)    │  │  Neon PostgreSQL        │
│  health · chat · recommendations   │  │  28 models              │
│  module1_sync · scrape_match        │  │  22 migrations          │
│  strategy                           │  └────────────────────────┘
│  OpenAI · Groq · OpenRouter · Gemini│
│  Firecrawl · Serper                 │
└─────────────────────────────────────┘
```

The Express API is the central orchestrator — it authenticates users, manages data, and delegates all AI workloads to the FastAPI server. The Next.js frontend never calls the AI server directly. Both services are containerized and deployed separately on Render.

---

## 🛠️ Tech Stack

| Layer | Technology |
|:------|:----------|
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
| **Deployment** | Vercel · Render · Neon · Docker |
| **CI/CD** | GitHub Actions (6 jobs: server, web, ai-server, migrate, docker-build, deploy) |

---

## 📁 Project Structure

```
EducAI/
├── web/                          # Next.js 16 frontend (App Router)
│   ├── app/
│   │   ├── (protected)/app/      # 19 profile-gated pages
│   │   ├── auth/                 # Sign in, sign up, verify, reset
│   │   ├── onboarding/           # Multi-step onboarding wizard
│   │   └── api/                  # Next.js API handlers
│   ├── components/               # Shared UI components
│   └── lib/                      # Auth helpers, server actions
│
├── server/                       # Express 5 API (Node 22, TypeScript)
│   ├── src/
│   │   ├── routes/               # 20 routers
│   │   ├── controllers/          # 20 controllers
│   │   └── services/             # Business logic, email, LLM calls
│   └── prisma/
│       ├── schema.prisma         # 28 models
│       ├── seedScholarships.ts   # 28 real-world scholarships
│       └── seedVisaTemplates.ts  # Visa milestones: US, UK, CA, AU, DE
│
├── ai-server/                    # FastAPI AI server (Python 3.13)
│   └── app/
│       ├── api/v1/               # health · chat · recommendations · scrape_match · strategy
│       └── domains/              # reasoning · scraping · searching · embeddings
│
├── render.yaml                   # Render deployment blueprint
└── docker-compose.yml            # Local multi-service development
```

---

## ⚙️ Local Setup

### Prerequisites

- Node.js 22+
- Python 3.13+
- A [Neon](https://neon.tech) database URL (free tier works)
- Docker (optional)

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
npm run seed:scholarships   # seeds 28 scholarships
npm run seed:visa           # seeds visa timeline templates
npm run dev                 # starts on :8000
```

### 3. FastAPI AI Server

```bash
cd ai-server
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### 4. Next.js Frontend

```bash
cd web
npm install
npm run dev     # starts on :3000
```

---

## 🔑 Environment Variables

### `server/.env`

| Variable | Required | Description |
|:---------|:--------:|:------------|
| `DATABASE_URL` | ✅ | Neon pooler connection string |
| `JWT_SECRET` | ✅ | 32+ char access token secret |
| `REFRESH_JWT_SECRET` | ✅ | 32+ char refresh token secret |
| `SESSION_SECRET` | ✅ | Express session secret |
| `AI_SERVER_URL` | ✅ | FastAPI base URL |
| `AI_SERVER_API_KEY` | ✅ | Shared secret with AI server |
| `ARCJET_KEY` | Recommended | Rate limiting & bot protection |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth |
| `EMAIL_HOST` / `EMAIL_USER` / `EMAIL_PASS` | Optional | SMTP (Resend in prod) |
| `CRON_SECRET` | Recommended | Protects deadline alert cron endpoint |

### `web/.env.local`

| Variable | Required | Description |
|:---------|:--------:|:------------|
| `SESSION_SECRET_KEY` | ✅ | iron-session key (32+ chars) |
| `BACKEND_URL` | ✅ | Express API base URL |
| `JWT_SECRET` | ✅ | Must match server JWT_SECRET |

### `ai-server/.env`

| Variable | Required | Description |
|:---------|:--------:|:------------|
| `MASTER_APIKEY` | ✅ | Must match `AI_SERVER_API_KEY` on Express server |
| `OPENAI_API_KEY` | Recommended | Primary LLM — GPT-4o-mini |
| `GROQ_API_KEY` | Optional | Free-tier LLM fallback |
| `OPENROUTER_API_KEY` | Optional | Secondary LLM fallback |
| `GEMINI_API_KEY` | Optional | Tertiary LLM fallback |
| `SERPER_API_KEY` | Optional | Web search for professor discovery |
| `FIRECRAWL_API_KEY` | Optional | Live university page scraping |

> **No API keys?** All pages still load. AI features return labeled fallback responses. The platform is transparent about what requires live credentials.

---

## 🧪 Testing & Validation

```bash
# Express API
cd server && npm run lint && npm run build && npm test

# FastAPI AI Server
cd ai-server && ruff check . && pytest --tb=short -q

# Next.js
cd web && npm run lint && npm run build

# Prisma
npx prisma validate && npx prisma generate
```

---

## 🚢 Deployment

| Layer | Platform | Notes |
|:------|:---------|:------|
| Frontend | [Vercel](https://vercel.com) | Auto-deploy on push to `main` |
| Express API | [Render](https://render.com) | `render.yaml` blueprint included |
| FastAPI AI Server | [Render](https://render.com) | Separate service in `render.yaml` |
| Database | [Neon](https://neon.tech) | Serverless PostgreSQL, free tier |

### Health Endpoints

| Endpoint | Purpose |
|:---------|:--------|
| `GET /health` | Express API liveness |
| `GET /health/db` | DB connectivity |
| `GET /api/v1/health` | AI server liveness |
| `GET /api/v1/health/llm` | LLM provider status |

### First Production Deploy

```bash
cd server
npm run db:migrate:deploy   # apply all migrations
npm run seed:scholarships   # run once
npm run seed:visa           # run once
```

Import `render.yaml` in the Render dashboard to create both backend services with pre-configured environment variables and health check paths.

---

## ⚡ CI/CD Pipeline

**`ci-cd.yml`** — triggers on push to `main` or `develop`:

| Job | What it checks |
|:----|:--------------|
| **Server** | `npm ci` → `prisma generate + validate` → lint → tsc → Jest |
| **Web** | `npm ci` → lint → production build |
| **AI Server** | `pip install` → `ruff check` → pytest |
| **DB Migrate** | TCP check → `prisma migrate deploy` (graceful skip if Neon is paused) |
| **Docker Build** | Builds all three service images with layer caching |
| **Deploy** | Pushes to Docker Hub when secrets are configured |

**`scholarship-alerts.yml`** — daily at 08:00 UTC, triggers deadline alert cron.

**`data-sync.yml`** — daily at 06:00 UTC, triggers program and scholarship data refresh.

---

## 📊 Module Status

| Module | Feature | Status |
|:-------|:--------|:------:|
| **Matching** | AI Program Match | ✅ |
| | Admission Requirement Analyzer | ✅ |
| | Application Timeline Planner | ✅ |
| | Application Strategy Generator | ✅ |
| **Funding** | Scholarship Hunter (28 records) | ✅ |
| | Funding Eligibility Checker | ✅ |
| | Funding Probability Predictor | ✅ |
| | Scholarship Deadline Alerts | ✅ |
| **Documents** | SOP Builder | ✅ |
| | CV Builder | ✅ |
| | Professor Finder | ✅ |
| | Gap Fix Recommender | ✅ |
| **Career / Immigration** | Career Outcome Predictor | ✅ |
| | PR & Immigration Guide | ✅ |
| | AI Advisor Chatbot | ✅ |
| | Education Pulse | ✅ |
| | Data Freshness | ✅ |

---

## 🔐 Authentication

- **Sign up** → email verification → sign in
- **Sign in** → JWT access token (15 min) + refresh token (15 days) · optional 30-day "Remember Me" · 5-attempt lockout
- **Google OAuth** → Passport.js redirect flow → account link or creation
- **Profile gating** → all platform features require completed onboarding; new users are redirected to the onboarding wizard
- Sessions managed with iron-session on the Next.js side; raw JWTs on the Express API side

---

## 👤 Author

**Prohar Saha Polak**

| | |
|:-|:-|
| GitHub | [github.com/Prohar04](https://github.com/Prohar04) |
| Email | sahaprohar10@gmail.com |

---

<div align="center">

Built with [Next.js](https://nextjs.org) · [FastAPI](https://fastapi.tiangolo.com) · [Prisma](https://www.prisma.io) · [Neon](https://neon.tech)

</div>
