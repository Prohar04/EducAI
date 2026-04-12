# Current State Audit

**Date:** 2026-04-12  
**Auditor:** Claude Sonnet 4.6

---

## Repository Structure

```
EducAI/
├── ai-server/      FastAPI + Python (AI, RAG, LLM, scraping)
├── server/         Express + TypeScript + Prisma (main API)
├── web/            Next.js 15 (frontend)
└── docs/           Project documentation
```

---

## Server (Express / TypeScript)

### Strengths
- Full JWT auth with refresh tokens, sessions, OAuth (Google), email verification
- Comprehensive Prisma schema: 20+ models covering all domain entities
- All Module 1 routes implemented: match, program, university, timeline, strategy
- Module 2 routes implemented: scholarship, deadlineAlert
- Ingest routes for AI→server data pipeline
- Chat route with profile-context injection

### Weaknesses / Gaps
- No PostgreSQL-backed search cache (uploaded API concept not yet integrated)
- Program search is naive SQL LIKE — no NLP or query rewriting
- `noDataMessage` in program controller signals empty DB but no auto-seed path documented
- Scholarship seed script exists but doc coverage unclear

### Routes Inventory
| Route | Method | Auth | Status |
|-------|--------|------|--------|
| /auth/* | * | no | ✅ |
| /users/* | * | yes | ✅ |
| /programs | GET | yes | ✅ |
| /programs/:id | GET | yes | ✅ |
| /universities | GET | yes | ✅ |
| /match/run | POST | yes | ✅ |
| /match/latest | GET | yes | ✅ |
| /match/run/:id/status | GET | yes | ✅ |
| /saved-programs | GET/POST/DELETE | yes | ✅ |
| /timeline/* | GET/POST | yes | ✅ |
| /strategy/* | GET/POST | yes | ✅ |
| /scholarships | GET | yes | ✅ |
| /scholarships/:id | GET | yes | ✅ |
| /scholarships/eligible | GET | yes | ✅ |
| /scholarships/probability/:id | GET | yes | ✅ |
| /deadline-alerts/* | GET/POST | yes | ✅ |
| /chat/message | POST | yes | ✅ |
| /ingest/* | POST | internal | ✅ |

---

## AI Server (FastAPI / Python)

### Strengths
- Full RAG pipeline: ChromaDB vector cache → Serper search → Firecrawl scrape → LLM extraction
- 4-phase pipeline: cache check → search/scrape → structure → persist
- Strategy generation with LLM + profile context
- Chat endpoint with web search, page scraping, internal DB context
- Audit middleware, secure key middleware

### Weaknesses / Gaps
- ChromaDB/LangChain import crashes on Python 3.14 (lazy-init workaround in place)
- No in-process PostgreSQL search cache (relies entirely on ChromaDB)
- Strategy route is very large (file complexity risk)

---

## Web (Next.js 15)

### Strengths
- App Router with protected layout and auth middleware
- Complete onboarding wizard (4-step profile setup)
- Match page with real-time polling and progress bar
- Programs page with filters and save functionality
- Scholarships page with eligibility + probability UI
- Timeline planner with country/intake selector
- Strategy report with full consultancy output
- AI Agent page + ChatbotWidget floating drawer
- Dashboard with real RSS education pulse feed
- Motion components (FadeIn, Reveal, Stagger, AnimatedCard)
- Dark mode with Tailwind + shadcn/ui

### Weaknesses / Gaps
- Programs page search is keyword-only (no NLP)
- Dashboard `/app/dashboard` redirects to `/app` home — separate views conflated
- Agent page needs better full-screen chat layout
- Some pages have thin empty states

---

## Data Quality

| Feature | Data Source | Quality |
|---------|-------------|---------|
| Programs | AI scrape → Prisma DB | Real (scraped from web) |
| Scholarships | Seed data | 28 real scholarships seeded |
| Visa templates | Seeded constants | 5 countries (US/UK/CA/AU/DE) |
| Match results | Live AI scrape per run | Real, 24h cached |
| Strategy | LLM reasoning + saved programs | AI-generated, profile-backed |
| Education pulse | RSS feed (real news) | Real RSS (Google/BBC/Times) |
| Chat responses | LLM + web search + DB context | Real, source-cited |

---

## CI/Build Status (as of audit)

| Check | Status |
|-------|--------|
| Server build | ✅ TypeScript clean |
| Web build | ✅ 31 routes |
| AI server lint | ✅ Ruff clean |
| Prisma validate | ✅ Schema valid |
| Server tests | ✅ 62/62 |

---

## Priority Improvements

1. **Search intelligence layer** (highest impact — fulfills uploaded API concept)
2. **NLP programs search bar** in frontend
3. **UI polish pass** — consistent spacing, better cards, smoother states
4. **Agent page layout** — full-screen chat experience
5. **Documentation accuracy** — align docs with actual state
