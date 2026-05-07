# Required GitHub Secrets & Render Environment Variables

## GitHub Actions Secrets

Go to: **GitHub repo → Settings → Secrets and variables → Actions**

### Existing secrets (verify these are already set)

| Secret | Purpose |
|---|---|
| `DATABASE_URL_CLOUD` | Neon PostgreSQL connection string (used by CI migrate job) |
| `JWT_SECRET` | Access token signing key |
| `REFRESH_JWT_SECRET` | Refresh token signing key |
| `SESSION_SECRET` | Session encryption key |
| `AI_SERVER_URL` | Internal URL for the FastAPI AI server |
| `AI_SERVER_API_KEY` | Shared secret between Express API and FastAPI |
| `OPENAI_API_KEY` | OpenAI API key (used for AI features and Job Finder fallback) |
| `CRON_SECRET` | Shared secret for cron/background-refresh endpoints |
| `ARCJET_KEY` | Arcjet rate-limiting key |
| `BACKEND_URL` | Public URL of the Express API (used by job-data-sync workflow) |
| `DOCKERHUB_USERNAME` | Docker Hub username (used by deploy job) |
| `DOCKERHUB_TOKEN` | Docker Hub access token (used by deploy job) |

### New secrets required for Job Finder

| Secret | Where to get it |
|---|---|
| `ADZUNA_APP_ID` | [developer.adzuna.com](https://developer.adzuna.com) → Register → API Access Details |
| `ADZUNA_APP_KEY` | Same Adzuna dashboard as above |
| `RAPIDAPI_KEY` | [rapidapi.com](https://rapidapi.com) → Search "JSearch" → Subscribe FREE → Endpoints tab → X-RapidAPI-Key |

> **Note:** If these secrets are not set, Job Finder will fall through to the OpenAI fallback automatically. No CI failure will occur — all env var reads use empty-string defaults.

---

## Render Environment Variables

Go to: **Render dashboard → each service → Environment**

### Express API service — add these

```
ADZUNA_APP_ID      = <your Adzuna App ID>
ADZUNA_APP_KEY     = <your Adzuna App Key>
RAPIDAPI_KEY       = <your RapidAPI key>
```

### FastAPI AI Server service — add these

```
ADZUNA_APP_ID      = <same Adzuna App ID>
ADZUNA_APP_KEY     = <same Adzuna App Key>
RAPIDAPI_KEY       = <same RapidAPI key>
```

---

## Vercel Environment Variables

Job Finder keys are **not** needed in Vercel. The frontend never calls job APIs directly — all requests go through the Express API.

---

## Job Data Sync Workflow

The file `.github/workflows/job-data-sync.yml` runs hourly to refresh cached job listings. It requires:

- `BACKEND_URL` — the public URL of your Express API (e.g. `https://api.educai.app`)
- `CRON_SECRET` — must match the `CRON_SECRET` env var on your server

If either secret is missing the workflow skips gracefully with a warning instead of failing.
