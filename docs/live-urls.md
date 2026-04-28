# EducAI — Live URLs

**Deployment date:** 2026-04-27

## Services

| Service | URL | Platform |
|---|---|---|
| **Frontend (Next.js)** | https://educai-web.vercel.app | Vercel (Hobby) |
| **Frontend (Render)** | https://educai-gday.onrender.com | Render (Free) |
| **Express API** | https://educai-api-91ai.onrender.com | Render (Free) |
| **FastAPI AI Server** | https://educai-ai-rd5y.onrender.com | Render (Free) |
| **Database** | Neon PostgreSQL (serverless, ap-southeast-1) | Neon (Free) |

## Health Endpoints

All primary health endpoints are **liveness-only** (no DB or AI dependency) — safe for frequent uptime polling.

### UptimeRobot monitor URLs (free plan compatible)

> **Free UptimeRobot plan note:** The free plan sends HEAD requests, not GET. All endpoints below explicitly support both GET and HEAD and return HTTP 200 for each.

| Service | Deployed URL | Monitor path | HEAD support |
|---|---|---|---|
| Express API | `https://educai-api-91ai.onrender.com` | `/health` | ✅ automatic (Express) |
| FastAPI AI Server | `https://educai-ai-rd5y.onrender.com` | `/api/v1/health` | ✅ explicit HEAD handler |
| Render Web / gday | `https://educai-gday.onrender.com` | `/api/v1/health` | ✅ explicit HEAD handler |

**Verified live curl results:**
- `GET  https://educai-api-91ai.onrender.com/health` → 200 ✅
- `HEAD https://educai-api-91ai.onrender.com/health` → 200 ✅ (Express auto-handles)
- `GET  https://educai-ai-rd5y.onrender.com/api/v1/health` → 200 ✅
- `HEAD https://educai-ai-rd5y.onrender.com/api/v1/health` → 200 ✅ (explicit handler added)
- `GET  https://educai-gday.onrender.com/api/v1/health` → 200 ✅
- `HEAD https://educai-gday.onrender.com/api/v1/health` → 200 ✅ (same FastAPI codebase)

GET responses return:
```json
{ "status": "ok", "service": "<name>", "version": "...", "environment": "production", "uptime": 123, "timestamp": "..." }
```

HEAD responses return an empty body with `200 OK` — this is all UptimeRobot needs.

### What was wrong before

| Service | Old (broken) URL | Problem |
|---|---|---|
| FastAPI AI Server | `/api/v1/health` | GET worked, HEAD returned 405 — UptimeRobot failed |
| Render Web / gday | `/api/health` (documented) | Returns 404 — wrong path; actual live path is `/api/v1/health` |

### Additional diagnostic endpoints (not for uptime monitoring)

| Endpoint | Purpose |
|---|---|
| `GET https://educai-api-91ai.onrender.com/health/db` | DB connectivity check |
| `GET https://educai-ai-rd5y.onrender.com/api/v1/health/llm` | LLM provider status |

## Render Service IDs

| Service | ID |
|---|---|
| Express API | `srv-d7n57opo3t8c73eg598g` |
| FastAPI AI Server | `srv-d7n587t7vvec738ucg7g` |

## Vercel

| Field | Value |
|---|---|
| Project ID | `prj_aYtvUSWIR5xcPjM4c6n8h3uQwp1m` |
| Team | prohor-sahas-projects |

## Free-Tier Limitations

- **Render cold starts:** Services spin down after ~15 minutes of inactivity. First request after idle may take 30–60 seconds to wake.
- **Neon auto-pause:** The database compute pauses after ~5 minutes of inactivity. The Express API Prisma client handles reconnection automatically.
- **No persistent disk:** Uploaded files (Gap Fix evidence) are stored on ephemeral Render disk — they are lost on redeploy. For production, migrate to S3/R2.
- **Google OAuth:** Not configured — Google Client ID/Secret not provided. Sign-in with Google will return 503. Email/password auth works normally.
- **Email alerts:** SMTP (Resend) not configured in this deployment. Scholarship deadline email alerts are disabled.

## Demo Recommended Flow

See `docs/showcase-readiness.md` for the full recommended demo flow.
Short version:
1. Sign up at https://educai-web.vercel.app/auth/signup
2. Complete onboarding (CS/AI, MSc, Canada + UK targets)
3. AI Program Match → Scholarships → Timeline → SOP → CV → Gap Fix → Career → Chat
