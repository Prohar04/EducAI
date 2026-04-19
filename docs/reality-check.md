# EducAI Reality Check — Module Completion Audit

**Audited:** 2026-04-19  
**Auditor:** Claude Code (principal engineer pass)

---

## Feature Completion Table

| Feature | Expected | Status | Evidence | Notes |
|---------|----------|--------|----------|-------|
| **MODULE 1** | | | | |
| Smart University & Program Matching | ✅ | **COMPLETE** | `match.router.ts`, `scrape_match.py` (Firecrawl + LLM ranking), polling UI | Background AI job with status polling |
| Dynamic Admission Requirement Analyzer | ✅ | **COMPLETE** | `ProgramRequirement` model, extracted during scrapes, embedded in chat | No standalone UI; embedded in program detail + chat context |
| Application Timeline Planner | ✅ | **COMPLETE** | `timeline.router.ts`, `UserRoadmap` model, `VisaTimelineTemplate` | Month-by-month roadmap with visa milestones for US/UK/CA/AU/DE |
| Application Strategy Generator | ✅ | **COMPLETE** | `strategy.router.ts`, LLM-backed with caching, country-aware | Admission bands, risk factors, strategy recommendations |
| **MODULE 2** | | | | |
| AI Scholarship Hunter | ✅ | **COMPLETE** | 28 real scholarships seeded, full-text search, filtering, detail pages | Includes Fulbright, Chevening, DAAD, Gates Cambridge, etc. |
| Funding Eligibility Checker | ✅ | **COMPLETE** | `checkEligibility()` in `scholarship.service.ts` | 5-factor deterministic scoring (GPA, level, nationality, English, need) |
| Scholarship Deadline Alert System | ✅ | **COMPLETE** | `deadlineAlert.service.ts`, daily cron via `scholarship-alerts.yml` | 4-window system (30/14/7/1 days), idempotent via DB constraint |
| Funding Probability Predictor | ✅ | **COMPLETE** | `predictFundingProbability()` in `scholarship.service.ts` | 6-factor weighted scoring, probability band output |
| **MODULE 3** | | | | |
| AI SOP Builder | ✅ | **COMPLETE** | `sop.service.ts`, 3 tones × 3 types, LLM-generated, copy/download | OpenRouter (gpt-4o-mini), fallback when no API key |
| AI CV Builder | ✅ | **COMPLETE** | `cv.service.ts`, 3 styles, ATS-friendly plain text | Academic / Research / Industry styles |
| Professor Finder | ✅ | **COMPLETE** | `professors.service.ts`, Serper web search + LLM cold-email template | Search by research interest, university, country, level |
| Micro-Course & Gap Fix Recommender | ✅ | **COMPLETE** *(new)* | `gapfix.service.ts`, `/app/gap-fix` page | Profile weakness analysis, LLM recommendations, fallback logic |
| **MODULE 4** | | | | |
| Career Outcome Predictor | ✅ | **COMPLETE** *(new)* | `career.service.ts`, `/app/career` page | Employability score, factors, pathways, salary ranges, skills |
| PR & Immigration Insight Engine | ✅ | **COMPLETE** *(new)* | `immigration.service.ts`, `/app/immigration` page | Step-by-step pathways for US/UK/CA/AU/DE, advantages/challenges, official sources |
| AI Abroad Assistant Chatbot | ✅ | **COMPLETE** | `chat.service.ts`, `ChatbotWidget`, ai-server chat endpoint | Profile-aware, citations, floating widget in all protected pages |
| Autonomous Data Crawling Agent | ✅ | **COMPLETE** *(new)* | `dataSync.service.ts`, `/app/data-sync` page, `data-sync.yml` workflow | Daily 06:00 UTC GitHub Actions workflow, manual trigger, logged runs |

---

## Architecture Overview

```
web (Next.js 16)
  └── /app/(protected)/app/
        ├── dashboard, home, profile
        ├── programs, match, saved        ← Module 1
        ├── timeline, strategy             ← Module 1
        ├── scholarships                   ← Module 2
        ├── sop, cv, professors            ← Module 3
        ├── gap-fix                        ← Module 3 (new)
        ├── career, immigration            ← Module 4 (new)
        └── data-sync                      ← Module 4 (new)

server (Express + Prisma)
  └── 20 route groups, 20 controllers, 20 services

ai-server (FastAPI)
  └── chat, module1/scrape-match, module1/sync, strategy, recommendations, health
```

---

## Provider & Key Dependencies

| Feature | Key Required | Fallback Behavior |
|---------|-------------|-------------------|
| Program Match | `FIRECRAWL_API_KEY`, `OPENROUTER_API_KEY` | No results; error state shown |
| SOP / CV Builder | `OPENROUTER_API_KEY` | Structured placeholder returned |
| Professor Finder | `SERPER_API_KEY`, `OPENROUTER_API_KEY` | No results; error state shown |
| Gap Fix Recommender | `OPENROUTER_API_KEY` | Rule-based fallback recommendations (fully functional) |
| Career Predictor | `OPENROUTER_API_KEY` | Profile-based fallback result (fully functional) |
| Immigration Guide | `OPENROUTER_API_KEY` | Template-based pathway data (fully functional) |
| Strategy | `OPENROUTER_API_KEY` | Error state; no cached strategy |
| Chat | `OPENROUTER_API_KEY` | Error state; no response |
| Scholarship Alerts | Email config (`RESEND`/SMTP) | Console log in dev; no email sent |
| Data Sync | `MASTER_APIKEY`, `CRON_SECRET` | Scholarships sync still works; program sync skipped |

---

## Known Limitations

1. **Program data is on-demand**: Programs are scraped when a user triggers a Match run. The Data Sync Agent adds a scheduled refresh layer but relies on the ai-server being reachable.

2. **Immigration guidance is guidance-only**: We use structured templates + LLM reasoning. This is not legal advice. Policies change frequently; the disclaimer is shown prominently on every response.

3. **Scholarship data is seeded**: 28 real scholarships are seeded from `prisma/seedScholarships.ts`. New scholarships must be added by rerunning the seed or adding to the pipeline.

4. **No real-time job market data**: Career Outcome Predictor uses LLM reasoning over general market knowledge, not live job APIs. Labeled clearly with a disclaimer.

5. **GRE/GMAT not in all program requirements**: Requirements are scraped from live pages and may be incomplete for some universities.
