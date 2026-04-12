# Module 2 Completion Log

**Date:** 2026-04-12

## Feature Status

### A. AI Scholarship Hunter ✅ Complete

**Backend:**
- `Scholarship` model with 11 enriched fields (description, amount, fundingType, minGpa, requiresEnglishTest, financialNeedRequired, eligibleNationalities, tags, sourceUrl, lastVerified, isActive)
- `ScholarshipDeadline` model with indexed deadline tracking
- `scholarship.service.ts`: `searchScholarships(filters)` — builds type-safe Prisma queries with AND clauses
- Routes: `GET /scholarships`, `GET /scholarships/eligible`, `GET /scholarships/deadlines`, `GET /scholarships/:id`
- 28 real-world scholarships seeded (Fulbright, NSF GRFP, Knight-Hennessy, Chevening, Commonwealth, DAAD, Vanier, Gates Cambridge, Erasmus Mundus, MEXT, KGSP, Schwarzman, etc.)

**Frontend:**
- `ScholarshipsClient.tsx` (~1000 lines): tabbed UI (All Scholarships / My Matches)
- Search + filter (country, level, funding type)
- Pagination, loading skeletons, empty states, error states with retry
- Source URL, provider, amount displayed per card
- `DeadlinesStrip`: horizontal scrolling strip of upcoming deadlines

### B. Funding Eligibility Checker ✅ Complete

**Backend:**
- `checkEligibility(scholarshipId, profile)`: deterministic scoring (GPA 30%, level 20%, nationality 25%, English 15%, financial need 10%)
- Returns: `eligible | partial | not_eligible`, score, met requirements, missing requirements, improvement actions
- Route: `POST /scholarships/:id/eligibility`

**Frontend:**
- `EligibilityModal`: tab-based dialog showing eligibility + probability
- Progress bars per criterion
- Met/missing requirements lists with icons

### C. Scholarship Deadline Alert System ✅ Complete

**New model:** `ScholarshipAlertLog` — deduplication guard for sent alerts  
**New migration:** `20260412100000_add_scholarship_alert_log/migration.sql`

**Backend:**
- `deadlineAlert.service.ts`:
  - `findPendingAlerts()` — scans upcoming deadlines (30-day window), returns unsent (user, deadline, window) tuples
  - `runDeadlineAlertJob()` — groups by user, sends email, logs to DB
  - `getRecentAlerts(userId)` — notification panel data
  - `getRecentAlertCount(userId)` — badge count
- Alert windows: 30, 14, 7, 1 days before deadline
- Email template: `sendScholarshipDeadlineAlert()` in `email.service.ts`
  - Dev mode: console adapter (no SMTP needed)
  - Prod mode: SMTP via existing nodemailer config
- Routes: `POST /deadline-alerts/run`, `GET /deadline-alerts/pending`, `GET /deadline-alerts/recent`, `GET /deadline-alerts/count`

**Scheduler:**
- `.github/workflows/scholarship-alerts.yml` — GitHub Actions cron at 08:00 UTC daily
- Endpoint protected by `CRON_SECRET` header
- Manual trigger available via `workflow_dispatch`

**Frontend:**
- Notification Bell in Navbar (next to user avatar)
- Opens a dropdown panel with recent alerts, scholarship links, days-before-sent label
- Lazy-loaded on first open

### D. Funding Probability Predictor ✅ Complete

**Backend:**
- `predictFundingProbability(scholarshipId, profile)`: 6-factor weighted scoring
  - GPA fit: 30%
  - English test: 20%
  - Profile completeness: 15%
  - Work experience: 15%
  - Financial need: 10%
  - Degree level: 10%
- Returns: `probabilityPct`, `factors[]` with individual scores, `strengths[]`, `weaknesses[]`, `improvementActions[]`, `confidence`
- Route: `POST /scholarships/:id/probability`

**Frontend:**
- In `EligibilityModal`: "Funding Probability" tab
- Gauge-style probability display
- Factor breakdown with individual progress bars
- Strengths / weaknesses / actions sections

---

## Dashboard Integration

- `ImportantDeadlines` on the Study Plan dashboard now uses **real deadline data** from saved programs (previously used hardcoded `"Dec 15, 2026"` placeholder dates)
- Data computed server-side (no `Date.now()` in render — pure component)
- Shows top 5 upcoming deadlines sorted by date
- Priority colors: red (≤30d), amber (≤90d), blue (>90d)
- Empty state links to `/app/programs`

---

## Required Production Secrets

| Secret | Purpose |
|--------|---------|
| `CRON_SECRET` | Protect `POST /deadline-alerts/run` from unauthorized callers |
| `API_BASE_URL` | Base URL for the cron workflow to call |
| `EMAIL_PROVIDER` + `EMAIL_USER` + `EMAIL_PASS` | SMTP delivery (console fallback in dev) |

---

## Known Limitations

- Alert system covers **all users** — no per-user preference toggle yet (planned: opt-in settings page)
- Scholarship data is seeded from static records; no live API scraper (adds `lastVerified` field for freshness tracking)
- `in_app` channel alerts are tracked in the log but the real-time websocket delivery is not implemented — polling via the Navbar bell is the current mechanism
