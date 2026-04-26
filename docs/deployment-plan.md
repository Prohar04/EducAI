# EducAI — Deployment Plan

## Architecture

| Service | Platform | Purpose |
|---------|----------|---------|
| `web/` (Next.js 16) | Vercel | Frontend + SSR + auth session management |
| `server/` (Express 5) | Render (Web Service, Node) | REST API, Prisma ORM, auth, all domain logic |
| `ai-server/` (FastAPI) | Render (Web Service, Python) | LLM chat, embeddings, strategy, scraping |
| PostgreSQL | Neon (Serverless) | Single production database shared by Express and FastAPI |

## Why This Split

- **Vercel for Next.js**: zero-config deployment, edge network, automatic preview deployments, native `output: standalone` support.
- **Render for Express**: free-tier Node.js web service with auto-deploy from Git, health checks, and managed SSL. Express API is purely server-side — no static hosting needed.
- **Render for FastAPI**: free-tier Python web service. FastAPI runs with uvicorn. Same region as Express reduces latency on AI calls.
- **Neon for PostgreSQL**: serverless Postgres with branching, automatic scaling, and a generous free tier. Compatible with Prisma's `@prisma/adapter-pg`.

## What Changed During Deployment Prep

### `server/`
1. `package.json` — moved `tsx` from devDependencies → dependencies; changed `start` to `tsx src/index.ts` (tsconfig uses `emitDeclarationOnly` so `node dist/index.js` was never viable); changed `build` to run `prisma generate && tsc --noEmit` (type-check only, no broken dist/).
2. `src/app.ts` — added `app.set('trust proxy', 1)` for Render's reverse proxy; upgraded CORS `origin` to support comma-separated list via `FRONTEND_URL`.
3. `prisma.config.ts` — added `DATABASE_URL` as highest-priority override so Render/Neon's standard env var works without renaming.

### `ai-server/`
4. `app/core/config.py` — made `CHROMADB_HOST`, `CHROMADB_PORT`, `APIFY_APIKEY` optional (were required, would crash server if unset on free tier).
5. `app/middleware/secure_keys.py` — removed hardcoded API keys (`server_a_key`, `server_b_key`); now validates against `MASTER_APIKEY` env var only.
6. `app/domains/scrapping/web_scrapper.py` — lazy-guarded ChromaDB init (only if `CHROMADB_HOST` set).
7. `app/domains/reasoning/rag_pipeline.py` — added clear RuntimeError if ChromaDB called without config.
8. `Dockerfile` — fixed to install from `pyproject.toml` via uv; updated port from 8888 → 8001 (matches Express's `AI_SERVER_URL` default); added system deps for psycopg2.

### Root
9. `render.yaml` — Render blueprint for both backend services with all env var declarations.

## Limitations on Free Tier

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Render free web services spin down after 15 min inactivity | Cold start ~30s on first request | UI shows loading state; chat proxy timeout is 38s to absorb this |
| Render free tier: 512 MB RAM | FastAPI with all deps may be tight | Monitor memory; upgrade to Starter ($7/mo) if needed |
| Neon free tier: 0.5 GB storage, 1 compute unit | Sufficient for development and early users | Upgrade Neon plan when DB grows |
| Local disk uploads (gap-fix evidence) are ephemeral on Render | Files lost on restart/redeploy | Future: migrate to S3/R2/Cloudinary |
| ChromaDB not hosted | RAG pipeline disabled | Use Render paid tier + persistent disk, or add a hosted Chroma |
| No background job scheduler on free tier | Deadline alerts cron may not fire | Move to Render cron job or external cron (GitHub Actions) |

## Deployment Order

1. Create Neon project → get `DATABASE_URL`
2. Deploy Express API on Render → get API URL
3. Deploy FastAPI AI server on Render → get AI server URL
4. Set `FRONTEND_URL` on Express to Vercel preview URL (temporary)
5. Deploy frontend on Vercel → get production URL
6. Update `FRONTEND_URL` on Express to final Vercel URL
7. Run `prisma migrate deploy` via Render Shell or CI
8. Run seed scripts if needed
9. Set `GOOGLE_CALLBACK_URL` in Google Cloud Console and Express env var
