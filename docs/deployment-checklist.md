# Deployment Checklist

Follow in order. Check each item before proceeding.

---

## Phase 0 — Prerequisites

- [ ] GitHub repo is up to date (push all changes)
- [ ] Neon account created at neon.tech
- [ ] Render account created at render.com
- [ ] Vercel account created at vercel.com
- [ ] Google Cloud Console project with OAuth 2.0 credentials
- [ ] Resend account at resend.com (for email)
- [ ] At least one LLM API key (OpenAI, OpenRouter, Gemini, or Groq)

---

## Phase 1 — Neon Database

- [ ] Create Neon project `educai` in US West (Oregon)
- [ ] Copy the **pooled** connection string
- [ ] Save it as `DATABASE_URL` — you'll need it for both Render services
- [ ] (Optional) Create a `staging` branch for non-production use

---

## Phase 2 — Express API on Render

- [ ] New Web Service → connect GitHub → select `EducAI` repo
- [ ] Root Directory: `server`
- [ ] Runtime: Node, Build: `npm ci && npx prisma generate`, Start: `npm start`
- [ ] Health Check: `/health`
- [ ] Set ALL required env vars (see `docs/production-env-vars.md`)
  - [ ] `DATABASE_URL` = Neon pooled URL
  - [ ] `JWT_SECRET` (new, secure)
  - [ ] `REFRESH_JWT_SECRET` (new, different from JWT_SECRET)
  - [ ] `SESSION_SECRET` (new, secure)
  - [ ] `FRONTEND_URL` = temporary placeholder (e.g. `http://localhost:3000`), update after Vercel deploy
  - [ ] `AI_SERVER_URL` = placeholder for now, update after AI server deploy
  - [ ] `AI_SERVER_API_KEY` = generate and save (must match AI server's MASTER_APIKEY)
  - [ ] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
  - [ ] Email vars
- [ ] First deploy completes
- [ ] `GET https://<api>.onrender.com/health` returns `{ "status": "OK" }`
- [ ] **Run migrations**: Render Shell → `npx prisma migrate deploy`
- [ ] `GET https://<api>.onrender.com/health/schema` returns `{ "ok": true }`
- [ ] Copy the Express API URL

---

## Phase 3 — FastAPI AI Server on Render

- [ ] New Web Service → connect GitHub → select `EducAI` repo
- [ ] Root Directory: `ai-server`
- [ ] Runtime: Python 3.13 (or Docker if Python build is unreliable)
- [ ] Start: `uvicorn app.main:app --host 0.0.0.0 --port 8001`
- [ ] Health Check: `/api/v1/health`
- [ ] Set env vars:
  - [ ] `MASTER_APIKEY` = same value as `AI_SERVER_API_KEY` on Express
  - [ ] `DATABASE_URL` = Neon pooled URL
  - [ ] At least one LLM API key
  - [ ] `SERVER_BASE_URL` = Express API URL
- [ ] First deploy completes
- [ ] `GET https://<ai>.onrender.com/api/v1/health` returns `{ "status": "ok" }`
- [ ] `GET https://<ai>.onrender.com/api/v1/health/llm` returns `{ "ok": true }`
- [ ] Copy the AI server URL

---

## Phase 4 — Update Express with final URLs

- [ ] Set `AI_SERVER_URL` = `https://<ai>.onrender.com` on Express service
- [ ] Set `FRONTEND_URL` = `https://<your-app>.vercel.app` (after Vercel deploy below)

---

## Phase 5 — Frontend on Vercel

- [ ] New Project → import `EducAI` repo
- [ ] Root Directory: `web`
- [ ] Framework: Next.js (auto)
- [ ] Set env vars:
  - [ ] `SESSION_SECRET_KEY` (new, secure, 32+ chars)
  - [ ] `BACKEND_URL` = Express API URL (no trailing slash)
  - [ ] `NEXT_PUBLIC_FRONTEND_URL` = this Vercel URL
  - [ ] `JWT_SECRET` = same as Express `JWT_SECRET`
- [ ] First deploy completes
- [ ] Visit the Vercel URL — landing page loads
- [ ] Sign up flow completes (check email arrives)
- [ ] Sign in flow completes
- [ ] `/app` loads after sign in

---

## Phase 6 — Google OAuth

- [ ] In Google Cloud Console → OAuth → Authorized redirect URIs:
  - Add `https://<api>.onrender.com/auth/google/callback`
- [ ] Test Google sign-in flow end-to-end

---

## Phase 7 — Seed Data (optional)

- [ ] Run via Render Shell on Express service:
  ```bash
  npx tsx prisma/seedVisaTemplates.ts
  npx tsx prisma/seedScholarships.ts
  ```
- [ ] `GET /health/timeline` returns `{ "ready": true, "visaTemplates": 5 }`

---

## Phase 8 — Post-deploy Verification

- [ ] `GET /health` → `{ "status": "OK" }`
- [ ] `GET /health/db` → database connected, row counts non-zero
- [ ] `GET /health/schema` → `{ "ok": true }`
- [ ] `GET /api/v1/health` (AI server) → `{ "status": "ok" }`
- [ ] Sign up new user → verification email received → sign in works
- [ ] Google OAuth sign in works
- [ ] Navigate to `/app` → dashboard loads
- [ ] Chat feature sends a message and receives AI response
- [ ] Programs search returns results
- [ ] Timeline planner loads
- [ ] Check browser console for CORS errors — should be none

---

## Common issues

| Symptom | Fix |
|---------|-----|
| Express 500 on startup | Check `DATABASE_URL` is set and Neon is reachable |
| `SESSION_SECRET_KEY is missing` | Set in Vercel env vars |
| CORS errors in browser | `FRONTEND_URL` on Express doesn't match Vercel URL |
| Chat returns 504 | AI server cold start — wait 30s and retry |
| Prisma: `P1001 Can't reach db` | Wrong `DATABASE_URL` or Neon compute is cold — retry |
| Google OAuth "redirect_uri_mismatch" | Add Render API URL to Google Console authorized URIs |
