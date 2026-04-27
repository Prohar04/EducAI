# EducAI — Deployment Execution Report

**Date:** 2026-04-27  
**Operator:** Claude Code (automated deployment)  
**Target:** Demo deployment — Vercel + Render + Neon

---

## Services Deployed

| Service | Status | URL |
|---|---|---|
| Frontend (Next.js 16) | ✅ Live | https://educai-web.vercel.app |
| Express API (Node 22) | 🔄 Deploying | https://educai-api-91ai.onrender.com |
| FastAPI AI Server (Python 3.13) | 🔄 Deploying | https://educai-ai-rd5y.onrender.com |
| Neon PostgreSQL | ✅ Migrated | ap-southeast-1 |

---

## Code Changes Made

### 1. `server/src/config/google.config.ts`
**Problem:** File threw `Error('Google Client ID and Secret must be set')` at module load time — crashed the server on Render since GOOGLE_CLIENT_ID/SECRET were not provided.  
**Fix:** Replaced the throw with a warning log. Exported `GOOGLE_OAUTH_ENABLED` flag for conditional route handling. OAuth strategy is only registered when both keys are present.

### 2. `server/src/controllers/auth.controller.ts`
**Problem:** Changed `import '../config/google.config.ts'` (side-effect only) to `import { GOOGLE_OAUTH_ENABLED } from '../config/google.config.ts'`.  
**Fix:** `googleAuth` and `googleAuthCallback` now return `503 Google OAuth is not configured` when `GOOGLE_OAUTH_ENABLED` is false, instead of crashing at module import.

### 3. `server/package.json` + `server/package-lock.json`
**Problem:** `@prisma/adapter-pg` and `prisma` CLI were in `devDependencies`. On Render, `NODE_ENV=production` causes `npm ci` to skip devDeps, making `@prisma/adapter-pg` unavailable at runtime and crashing the server at startup.  
**Fix:** Moved `@prisma/adapter-pg` and `prisma` from `devDependencies` to `dependencies`.

### 4. `render.yaml`
**Problem:** AI server build command used `uv pip install --system -r pyproject.toml` which pulls in `chromadb`, `crewai[tools]`, `apify-client` — heavy packages that cause build failures or timeouts on Render free tier.  
**Fix:** Changed build command to `pip install -r requirements-render.txt && prisma generate --schema prisma/schema.prisma`.

### 5. `ai-server/requirements-render.txt` (new file)
**Added:** Slim requirements with only the packages needed by active routes: `fastapi`, `uvicorn`, `httpx`, `loguru`, `pydantic-settings`, `python-dotenv`, `openai`, `prisma`, `psycopg2-binary`, `firecrawl-py`, `langchain`, `langchain-openai`.

---

## Deployment Steps Executed

1. **Neon DB** — Verified 21 migrations already applied. Ran `seed:scholarships` (27 scholarships upserted) and `seed:visa` (5 visa templates upserted).

2. **Render Express API** (`srv-d7n57opo3t8c73eg598g`) — Service created via Render API with:
   - Runtime: Node
   - Build: `npm ci && npx prisma generate`
   - Start: `npm start` (tsx src/index.ts)
   - Health check: `/health`
   - All required env vars set (DATABASE_URL, JWT_SECRET, REFRESH_JWT_SECRET, SESSION_SECRET, AI_SERVER_API_KEY, OPENAI_API_KEY, FRONTEND_URL, AI_SERVER_URL)

3. **Render FastAPI AI Server** (`srv-d7n587t7vvec738ucg7g`) — Service created with:
   - Runtime: Python
   - Build: `pip install -r requirements-render.txt && prisma generate --schema prisma/schema.prisma`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
   - Health check: `/api/v1/health`
   - Env vars: MASTER_APIKEY (= Express AI_SERVER_API_KEY), DATABASE_URL, OPENAI_API_KEY, LLM_PROVIDER=openai, LLM_MODEL=gpt-4o-mini

4. **Vercel Frontend** (`prj_aYtvUSWIR5xcPjM4c6n8h3uQwp1m`) — Project created and deployed with:
   - Framework: Next.js
   - Root dir: web
   - Env vars: SESSION_SECRET_KEY, BACKEND_URL, JWT_SECRET
   - Production URL: https://educai-web.vercel.app

5. **FRONTEND_URL** updated on Express service to `https://educai-web.vercel.app`
6. **BACKEND_URL** on Vercel updated to `https://educai-api-91ai.onrender.com`
7. **AI_SERVER_URL** on Express updated to `https://educai-ai-rd5y.onrender.com`

---

## Issues Found and Fixed

| Issue | Root Cause | Fix |
|---|---|---|
| Express crashes on startup | `google.config.ts` throws if OAuth keys absent | Made OAuth optional; returns 503 on OAuth routes |
| Express crashes on startup | `@prisma/adapter-pg` not installed (devDep skipped with NODE_ENV=production) | Moved to production dependencies |
| AI server build fails/slow | Heavy deps (chromadb, crewai) in full pyproject.toml | Created slim requirements-render.txt |

---

## Verification Results

| Check | Result |
|---|---|
| TypeScript compilation | ✅ 0 errors |
| 62 Jest tests | ✅ All pass |
| Neon DB connectivity (local) | ✅ Connected, migrations applied |
| Vercel frontend | ✅ 200 OK, serves EducAI page |
| Express API health | 🔄 Deploying (render cold start) |
| AI Server health | 🔄 Deploying |

---

## Manual Steps Still Required

1. **Wait for Render deploys to complete** (~5-10 min for build + cold start)
2. **Verify Express health:** `curl https://educai-api-91ai.onrender.com/health`
3. **Verify AI server health:** `curl https://educai-ai-rd5y.onrender.com/api/v1/health`
4. **Update README** live URLs:
   - Frontend: `https://educai-web.vercel.app` 
   - Express API: `https://educai-api-91ai.onrender.com`
   - AI Server: `https://educai-ai-rd5y.onrender.com`
5. **Optional — Google OAuth:** Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the Render Express service if wanted
6. **Optional — Email alerts:** Add Resend API key as EMAIL_PASS in the Render Express service

---

## Security Notes

- All secrets (JWT, session, API keys) were generated with `openssl rand` and set directly to Render/Vercel via API — never written to tracked files
- No secrets appear in any committed code
- AI_SERVER_API_KEY (Express) = MASTER_APIKEY (AI Server) — internal auth is wired and consistent
- Google OAuth is disabled (keys not provided) — routes return 503 gracefully
