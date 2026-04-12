# Release Blockers

**Updated:** 2026-04-12

## Status: ✅ All Critical Blockers Resolved

---

## Resolved Blockers

### 1. CI Pipeline Red — ESLint `global` not defined (RESOLVED)
- **File:** `server/tests/chat.test.js:28`
- **Root cause:** `global.fetch = mockFetch` — `global` not in ESLint test globals
- **Fix:** Added `global: 'readonly'` + `fetch: 'writable'` to `server/eslint.config.js`
- **Commit:** `1297782`

### 2. Dashboard Fake Deadline Data (RESOLVED)
- **File:** `web/app/(protected)/app/page.tsx` — `ImportantDeadlines` component
- **Root cause:** Hardcoded `"Dec 15, 2026"` placeholder dates used for all saved programs
- **Fix:** Compute real deadlines from `savedProgram.program.deadlines[]` server-side, pass as computed prop
- **Commit:** (next milestone commit)

### 3. Scholarship Deadline Alert System Missing (RESOLVED)
- Implemented `ScholarshipAlertLog` model, `deadlineAlert.service.ts`, email template, API routes, Navbar bell

### 4. Navbar: Scholarships marked "Soon" (RESOLVED)
- Scholarships was flagged `soon: true` in the Navbar even though fully implemented
- Fixed: `soon: false`; also added AI Agent (`/app/agent`) to the Tools menu

---

## Remaining Non-Blockers (Post-Launch)

| Item | Priority | Notes |
|------|----------|-------|
| User alert opt-in preferences | P2 | Currently all users receive alerts |
| Live scholarship scraper | P3 | Demo uses seeded data with `lastVerified` timestamps |
| Real-time WebSocket notification delivery | P3 | Navbar bell polls on open; sufficient for v1 |
| SOP Builder | Backlog | Module 3, out of scope |
| CV Builder | Backlog | Module 3, out of scope |
| Professor Finder | Backlog | Module 3, out of scope |

---

## Production Secrets Checklist

Server (`/server/.env`):
- [ ] `DATABASE_URL` — Neon pooler URL
- [ ] `JWT_SECRET` — random 64-char string
- [ ] `REFRESH_JWT_SECRET` — random 64-char string
- [ ] `ARCJET_KEY` — security rate-limiting
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth
- [ ] `EMAIL_USER` / `EMAIL_PASS` — Gmail App Password for SMTP
- [ ] `CRON_SECRET` — protect `/deadline-alerts/run`
- [ ] `AI_SERVER_URL` — ai-server base URL

Web (`/web/.env.local`):
- [ ] `SESSION_SECRET_KEY` — iron-session encryption key (min 32 chars)
- [ ] `NEXT_PUBLIC_BACKEND_URL` — public API base URL

GitHub Actions secrets:
- [ ] `DATABASE_URL_CLOUD` — enable auto-migration on push to main
- [ ] `DOCKERHUB_USERNAME` / `DOCKERHUB_TOKEN` — enable Docker push
- [ ] `API_BASE_URL` — enable deadline alert cron
- [ ] `CRON_SECRET` — matching server CRON_SECRET
