# EducAI

AI-powered learning platform.

## Architecture

| Service | Stack | Port |
| --- | --- | --- |
| **server** | Express 5 · Prisma · PostgreSQL | 8000 |
| **web** | Next.js 16 · React 19 · Tailwind | 3000 |
| **ai-server** | FastAPI · Python | — |

## Quick start

```bash
# 1. Copy env files
cp .env.example .env
cp server/.env.example server/.env
cp ai-server/.env.example ai-server/.env
cp web/.env.example web/.env.local

# 2. Start Postgres
docker compose up -d db

# 3. Server
cd server && npm i && npx prisma migrate dev && npm run dev

# 4. AI server
cd ai-server && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# 5. Web
cd web && npm i && npm run dev
```

## Chat setup

For the admissions chat drawer to work end to end:

- Set `AI_SERVER_URL=http://localhost:8001` in `server/.env`.
- Set `LLM_PROVIDER=openrouter` and `LLM_MODEL=openrouter/free` in `ai-server/.env`.
- Add `OPENROUTER_API_KEY` for the default low-cost chat model.
- Add `GEMINI_API_KEY` if you want the chat endpoint to fall back to Gemini.
- Add `SERPER_API_KEY` and `FIRECRAWL_API_KEY` so visa, scholarship, and latest-info questions can return fresh cited web results.

## Authentication

See [server/README.MD](server/README.MD) for the full endpoint list.

Key flows:

- **Sign up** → verification email → confirm → sign in
- **Sign in** → optional "Remember me" (30-day token) · account lockout after 5 failures
- **Forgot password** → reset email → new password
- **Google OAuth** → `/auth/google` redirect flow
