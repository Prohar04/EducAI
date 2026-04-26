# Production Environment Variables

Complete reference for all required and optional env vars across all services.
**Never commit real values. Use your platform's secret management.**

---

## Vercel (web/)

| Variable | Required | Example / Notes |
|----------|----------|----------------|
| `NODE_ENV` | yes | `production` |
| `SESSION_SECRET_KEY` | yes | `openssl rand -base64 32` — min 32 chars |
| `BACKEND_URL` | yes | `https://educai-api.onrender.com` — no trailing slash |
| `NEXT_PUBLIC_FRONTEND_URL` | yes | `https://educai.vercel.app` |
| `JWT_SECRET` | yes | Must match Express `JWT_SECRET` exactly |

---

## Render — Express API (server/)

### Security
| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | yes | `production` |
| `PORT` | yes | `8000` |
| `JWT_SECRET` | yes | `openssl rand -base64 32` |
| `REFRESH_JWT_SECRET` | yes | `openssl rand -base64 32` (different from JWT_SECRET) |
| `SESSION_SECRET` | yes | `openssl rand -base64 32` (for Express passport session) |

### Database
| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | yes | Neon pooled connection string |

### CORS & Service URLs
| Variable | Required | Notes |
|----------|----------|-------|
| `FRONTEND_URL` | yes | `https://educai.vercel.app` — comma-separate for multiple origins |
| `AI_SERVER_URL` | yes | `https://educai-ai.onrender.com` |
| `AI_SERVER_API_KEY` | yes | Must match AI server `MASTER_APIKEY` |

### Google OAuth
| Variable | Required | Notes |
|----------|----------|-------|
| `GOOGLE_CLIENT_ID` | yes (if using Google login) | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | yes (if using Google login) | Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | yes (if using Google login) | `https://educai-api.onrender.com/auth/google/callback` |

### Email
| Variable | Required | Notes |
|----------|----------|-------|
| `EMAIL_HOST` | yes | `smtp.resend.com` |
| `EMAIL_PORT` | yes | `465` |
| `EMAIL_SECURE` | yes | `true` |
| `EMAIL_USER` | yes | `resend` |
| `EMAIL_PASS` | yes | Resend API key (`re_xxx`) |
| `EMAIL_FROM` | yes | `EducAI <noreply@yourdomain.com>` |

### Optional
| Variable | Notes |
|----------|-------|
| `ARCJET_KEY` | arcjet.com — bot protection; server starts without it |
| `OPENAI_API_KEY` | Direct LLM fallback if AI server is down |
| `OPENROUTER_API_KEY` | Direct LLM fallback |
| `GROQ_API_KEY` | Direct LLM fallback |
| `GEMINI_API_KEY` | Direct LLM fallback |
| `CHAT_RATE_LIMIT_PER_MIN` | Default `20` |
| `INGEST_API_KEY` | Internal data ingest; must match AI server |
| `JWT_EXPIRES_IN` | Default `15m` |
| `REFRESH_JWT_EXPIRES_IN` | Default `15d` |
| `LOG_LEVEL` | Default `info` |

---

## Render — FastAPI AI Server (ai-server/)

### Required
| Variable | Notes |
|----------|-------|
| `MASTER_APIKEY` | `openssl rand -hex 32` — must match Express `AI_SERVER_API_KEY` |
| `DATABASE_URL` | Same Neon connection string as Express |

### LLM (at least one)
| Variable | Notes |
|----------|-------|
| `OPENAI_API_KEY` | Recommended — best quality; gpt-4o-mini default |
| `OPENROUTER_API_KEY` | Free tier available at openrouter.ai |
| `GEMINI_API_KEY` | Free at aistudio.google.com |
| `GROQ_API_KEY` | Fast, free at console.groq.com |
| `LLM_PROVIDER` | Optional override: `openai` / `openrouter` / `gemini` / `groq` / `xai` |
| `LLM_MODEL` | Optional override: e.g. `gpt-4o-mini` |

### Cross-service
| Variable | Notes |
|----------|-------|
| `SERVER_BASE_URL` | `https://educai-api.onrender.com` |
| `INGEST_API_KEY` | Must match Express |

### Optional
| Variable | Notes |
|----------|-------|
| `SERPER_API_KEY` | Web search for visa/scholarship data |
| `FIRECRAWL_API_KEY` | Page extraction |
| `APIFY_APIKEY` | University scraping |
| `CHROMADB_HOST` | Leave empty on free tier |
| `CHROMADB_PORT` | Leave empty on free tier |
| `XAI_API_KEY` | xAI/Grok (beta) |

---

## Key pairing matrix

These pairs must match exactly across services:

| Express var | Vercel var | Purpose |
|-------------|------------|---------|
| `JWT_SECRET` | `JWT_SECRET` | Google OAuth JWT verification |
| `FRONTEND_URL` | `NEXT_PUBLIC_FRONTEND_URL` | CORS + redirect base |

| Express var | AI server var | Purpose |
|-------------|--------------|---------|
| `AI_SERVER_API_KEY` | `MASTER_APIKEY` | Internal service auth |
| `INGEST_API_KEY` | `INGEST_API_KEY` | Module 1 data push |

---

## Generating secrets locally

```bash
# JWT / session secrets (base64)
openssl rand -base64 32

# API keys (hex, longer)
openssl rand -hex 32
```
