# Module Gap Analysis

**Date:** 2026-04-12

---

## Module 1: AI University & Program Matching System

| Feature | Required | Status | Gap |
|---------|----------|--------|-----|
| Smart University Recommender | ✅ | ✅ Complete | None — AI scrape-match with scoring |
| Dynamic Admission Requirement Analyzer | ✅ | ✅ Complete | Scraped requirements stored in ProgramRequirement |
| Application Timeline Planner | ✅ | ✅ Complete | Month-by-month roadmap, visa templates |
| Application Strategy Generator | ✅ | ✅ Complete | LLM consultancy, risk/action/checklist |

**Module 1 verdict: COMPLETE** ✅

---

## Module 2: Scholarship & Funding Intelligence

| Feature | Required | Status | Gap |
|---------|----------|--------|-----|
| AI Scholarship Hunter | ✅ | ⚠️ Schema only | Need routes, service, seed data, frontend |
| Funding Eligibility Checker | ✅ | ❌ Missing | Need deterministic engine + UI |
| Scholarship Deadline Alert System | ✅ | ❌ Missing | Need alert pipeline + in-app center |
| Funding Probability Predictor | ✅ | ❌ Missing | Need scoring engine + UI |

**Module 2 verdict: BUILD REQUIRED** 🔨

### Implementation Plan for Module 2

#### A. Scholarship Schema Extension
- Add to `Scholarship` model: `description`, `amount`, `fundingType`, `minGpa`, `requiresEnglishTest`, `financialNeedRequired`, `eligibleNationalities` (JSON), `tags` (JSON), `isActive`, `sourceUrl`, `lastVerified`
- Create Prisma migration SQL
- Run `prisma generate`

#### B. Scholarship Backend
Files to create:
- `server/src/services/scholarship.service.ts` — search/filter, eligibility, probability
- `server/src/controllers/scholarship.controller.ts` — HTTP handlers
- `server/src/routes/scholarship.router.ts` — route definitions
- Mount at `/scholarships` in `server/src/app.ts`
- Seed script: `server/prisma/seedScholarships.ts` (25+ records)

API endpoints:
```
GET  /scholarships             — search/filter with pagination
GET  /scholarships/:id         — get single scholarship
GET  /scholarships/eligible    — eligibility check against user profile
GET  /scholarships/deadlines   — upcoming deadlines (alert feed)
POST /scholarships/probability — funding probability for a scholarship
```

#### C. Scholarship Frontend
- Replace stub `web/app/(protected)/app/scholarships/page.tsx`
- Full search + filter UI (country, level, field, fundingType, CGPA)
- Scholarship card with: title, provider, amount, deadline, eligibility badge
- Eligibility detail drawer/modal
- Probability meter
- Alerts/upcoming deadlines section

#### D. Notification System (simplified in-app)
- No new DB table required
- Backend computes upcoming deadlines from `ScholarshipDeadline`
- Frontend `/scholarships` page shows "Upcoming Deadlines" section
- Optional: Browser notification or in-page toast for deadlines < 30 days away
- Email: dev-mode logs to console; production path documented for Resend integration

---

## Module 4: AI Chatbot

| Feature | Required | Status | Gap |
|---------|----------|--------|-----|
| /app/agent full-page chat | ✅ | ⚠️ Stub | Promote ChatbotWidget to full-page layout |
| Persistent chat drawer (shared) | ✅ | ✅ ChatbotWidget | Floating widget present on all protected pages |
| Profile-aware responses | ✅ | ✅ Complete | chat.service.ts injects profile context |
| Citations/sources in UI | ✅ | ✅ Complete | ChatbotWidget renders source cards |
| History, loading, error, retry states | ✅ | ✅ Complete | Full state machine in ChatbotWidget |
| Scholarship guidance | ✅ | ⚠️ Partial | Will improve after scholarship data seeded |
| Rate-limit handling | ✅ | ✅ Complete | 429 state handled in widget |
| Streaming | ❓ Nice-to-have | ❌ Not implemented | Non-blocking, reliability > streaming |

**Module 4 verdict: AGENT PAGE BUILD REQUIRED** 🔨

---

## UI/UX Gaps

| Area | Status | Action |
|------|--------|--------|
| Scholarships page | ❌ Stub | Build full UI |
| Agent page | ❌ Stub | Full-page chat layout |
| Landing page | ✅ Complete | Minor polish pass |
| Dashboard | ✅ Complete | — |
| Match | ✅ Complete | — |
| Timeline | ✅ Complete | — |
| Strategy | ✅ Complete | — |
| Saved programs | ✅ Complete | — |
| Profile | ✅ Complete | — |
| Dark mode | ✅ Complete | — |
| Mobile responsiveness | ✅ Good | Minor improvements |

---

## Engineering Quality Gaps

| Area | Status | Action |
|------|--------|--------|
| TypeScript types for Scholarship | Missing | Add to auth.type.ts |
| Zod validation on scholarship routes | Missing | Add in controller |
| Scholarship seed data | Missing | seedScholarships.ts |
| .env.example completeness | Partial | Document new vars |
| Test coverage | Minimal | Add critical path tests |
| Auto-commit script | Missing | scripts/auto-commit-progress.sh |
| README accuracy | Partial | Update with new features |
