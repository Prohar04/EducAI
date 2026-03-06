# EducAI

AI-powered learning platform.

## Architecture

| Service | Stack | Port |
|---|---|---|
| **server** | Express 5 · Prisma · PostgreSQL | 8000 |
| **web** | Next.js 16 · React 19 · Tailwind | 3000 |
| **ai-server** | FastAPI · Python | — |

## Quick start

```bash
# 1. Copy env files
cp .env.example .env
cp server/.env.example server/.env
cp web/.env.example web/.env.local

# 2. Start Postgres
docker compose up -d db

# 3. Server
cd server && npm i && npx prisma migrate dev && npm run dev

# 4. Web
cd web && npm i && npm run dev
```

## Authentication

See [server/README.MD](server/README.MD) for the full endpoint list.

Key flows:
- **Sign up** → verification email → confirm → sign in
- **Sign in** → optional "Remember me" (30-day token) · account lockout after 5 failures
- **Forgot password** → reset email → new password
- **Google OAuth** → `/auth/google` redirect flow
