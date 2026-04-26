# Render Setup — Express API

## Service configuration
| Setting | Value |
|---------|-------|
| Service type | Web Service |
| Runtime | Node |
| Region | Oregon (US West) |
| Plan | Free (upgrade for production traffic) |
| Root Directory | `server` |
| Build Command | `npm ci && npx prisma generate` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

## Why `npm start` works
The `start` script in `server/package.json` runs `tsx src/index.ts` directly. Since the tsconfig uses `emitDeclarationOnly: true` (type-check only, no JS emit), we use tsx as the runtime rather than compiling to dist. This is intentional and matches the Docker setup.

## Environment variables (set in Render dashboard)

### Required
| Variable | How to get |
|----------|-----------|
| `NODE_ENV` | `production` |
| `PORT` | `8000` |
| `DATABASE_URL` | From Neon dashboard → Connection string (pooled) |
| `JWT_SECRET` | `openssl rand -base64 32` |
| `REFRESH_JWT_SECRET` | `openssl rand -base64 32` |
| `SESSION_SECRET` | `openssl rand -base64 32` |
| `FRONTEND_URL` | Your Vercel deployment URL, e.g. `https://educai.vercel.app` |
| `AI_SERVER_URL` | Your Render FastAPI service URL, e.g. `https://educai-ai.onrender.com` |
| `AI_SERVER_API_KEY` | Same value as `MASTER_APIKEY` on the AI server |

### Google OAuth
| Variable | How to get |
|----------|-----------|
| `GOOGLE_CLIENT_ID` | Google Cloud Console → OAuth 2.0 Client IDs |
| `GOOGLE_CLIENT_SECRET` | Same |
| `GOOGLE_CALLBACK_URL` | `https://educai-api.onrender.com/auth/google/callback` |

**Important**: In Google Cloud Console → OAuth → Authorized redirect URIs, add:
```
https://educai-api.onrender.com/auth/google/callback
```

### Email (Resend)
| Variable | Value |
|----------|-------|
| `EMAIL_HOST` | `smtp.resend.com` |
| `EMAIL_PORT` | `465` |
| `EMAIL_SECURE` | `true` |
| `EMAIL_USER` | `resend` |
| `EMAIL_PASS` | Resend API key (`re_xxx`) from resend.com |
| `EMAIL_FROM` | `EducAI <noreply@yourdomain.com>` |

### Optional
| Variable | Purpose |
|----------|---------|
| `ARCJET_KEY` | Bot/rate-limit protection (arcjet.com) — server starts fine without it (module unused) |
| `OPENAI_API_KEY` | Direct LLM fallback when AI server is down |
| `OPENROUTER_API_KEY` | Direct LLM fallback |
| `GROQ_API_KEY` | Direct LLM fallback |
| `CHAT_RATE_LIMIT_PER_MIN` | Default `20` |
| `INGEST_API_KEY` | Shared secret for internal data ingest endpoint |
| `JWT_EXPIRES_IN` | Default `15m` |
| `REFRESH_JWT_EXPIRES_IN` | Default `15d` |

## Database migration (run once after first deploy)

Open Render → Shell for the `educai-api` service and run:
```bash
npx prisma migrate deploy
```

Or set it as a post-deploy hook — but be careful, `migrate deploy` is safe to run on every deploy.

## Health endpoints
| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Basic liveness |
| `GET /health/db` | Database connectivity + row counts |
| `GET /health/schema` | Confirms all migration tables exist |
| `GET /health/timeline` | Visa templates seed check |

## Free tier cold start
Render free services sleep after 15 minutes of inactivity. The first request after sleep takes ~30s. The Next.js chat proxy has a 38s timeout to absorb this. For other endpoints the frontend should show a skeleton/loading state.

To keep the service warm (optional), set up an external cron to ping `/health` every 10 minutes (e.g. UptimeRobot free tier).

## File uploads (gap-fix evidence)
The server stores uploaded files in `./uploads/gap-fix/` on the local disk. On Render free tier, **this disk is ephemeral** — files are lost on restart or redeploy. For production:
- Add a Render persistent disk (paid), or
- Migrate to S3/Cloudflare R2 (recommended for scale)
