# EducAI Server

## Setup

- [x] Install dependencies
- [x] Configure environment variables
- [x] Set up database
- [x] Run migrations

## Neon PostgreSQL (Cloud Database)

The server uses [Neon](https://neon.tech) as its cloud Postgres database.  
`DATABASE_URL_CLOUD` is used in production; `DATABASE_URL_LOCAL` is used in development.

### Environment variables

```env
DATABASE_URL_CLOUD=postgresql://...@...neon.tech/neondb?sslmode=require  # DO NOT COMMIT
DATABASE_URL_LOCAL=postgresql://educai:educai@localhost:5432/educai
PRISMA_MIGRATE_ENV=   # set to 'production' only when running migrate dev/reset on cloud
SEED_ENABLED=         # set to 'true' to allow db:seed:safe
```

### Database scripts

| Command | Description |
| --- | --- |
| `npm run db:generate` | Re-generate Prisma client after schema changes |
| `npm run db:migrate:dev` | Create + apply a new migration (local only — blocked on remote) |
| `npm run db:migrate:deploy` | Apply pending migrations to Neon/cloud (safe, no data loss) |
| `npm run db:status` | Show migration status |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed:safe` | Run seed with safety guard (needs `SEED_ENABLED=true`) |

### Migrate Neon (deployment)

```bash
cd server

# 1. Regenerate Prisma client (run after any schema changes)
npm run db:generate

# 2. Apply all pending migrations to Neon (never resets data)
NODE_ENV=production npm run db:migrate:deploy

# 3. Confirm migration state
npm run db:status
```

### Seed demo data (Module 1)

> ⚠️  **The seed file is for local development only.**
> Real data comes from the scraper ingestion pipeline (ai-server → `/internal/module1/ingest`).
> **Never run seed against the production Neon database** — it will overwrite real scraped records.

Seeding is **idempotent** — safe to re-run; existing rows are skipped, nothing is deleted.

- `npm run seed:visa`

```bash
# Local dev (no remote guard needed)
SEED_ENABLED=true tsx prisma/seed.ts

# Or via npm script with full guard
SEED_ENABLED=true npm run db:seed:safe
```

To seed against Neon (cloud), both flags are required:

```bash
SEED_ENABLED=true PRISMA_MIGRATE_ENV=production npm run db:seed:safe
```

### Safety guard (`scripts/assert-safe-db.ts`)

All destructive commands (`migrate dev`, `migrate reset`, `db push`) are wrapped with a guard that:

- Detects remote hosts (`neon.tech`, RDS, Supabase, etc.)
- Blocks unless `PRISMA_MIGRATE_ENV=production` is explicitly set
- Prints clear remediation steps

Always use `npm run db:migrate:deploy` for cloud deployments.

### Health check

```http
GET /health/db
```

Returns Prisma connection status and live user count:

```json
{ "status": "OK", "database": "connected", "counts": { "users": 0 } }
```

## Authentication

- [x] `POST /auth/signup` — Create account + send verification email
- [x] `POST /auth/signin` — Email/password login (lockout + remember-me)
- [x] `POST /auth/verify-email` — Confirm email with token
- [x] `POST /auth/resend-verification` — Resend verification email
- [x] `POST /auth/refresh` — Rotate refresh token (preserves TTL)
- [x] `POST /auth/signout` — Revoke tokens (requires Bearer)
- [x] `POST /auth/forgot-password` — Send password-reset email
- [x] `POST /auth/reset-password` — Set new password from token
- [x] `GET  /auth/google` — Google OAuth2 redirect
- [x] `GET  /auth/google/callback` — Google OAuth2 callback

### Auth features

| Feature | Details |
| --- | --- |
| Email verification | New accounts must verify via email link (24 h TTL) before sign-in |
| Account lockout | 5 failed passwords → 10-minute lockout (HTTP 423, `ACCOUNT_LOCKED`) |
| Remember me | `rememberMe: true` → 30-day refresh token; default is 15 days |
| TTL preservation | On token rotation the original TTL is carried forward |
| Password reset | Token-based (30 min TTL), invalidates all refresh tokens |
| Hashing | Argon2id for passwords, SHA-256 for tokens |

## Documentation

- [ ] Document API endpoints
- [ ] Create setup instructions
- [ ] Write usage examples
- [ ] Add troubleshooting guide

## Testing

- [x] Auth endpoint tests (34 tests — signup, signin, lockout, remember-me TTL, email verification, refresh, forgot/reset password)
- [x] Basic API tests (health, 404)
- [ ] Perform load testing
- [ ] Manual testing

Run tests:

```bash
npm test
```

## Deployment

- [ ] Code review
- [ ] Security audit
- [ ] Build production image
- [ ] Deploy to staging
- [ ] Deploy to production

## Monitoring

- [ ] Set up logging
- [ ] Configure alerts
- [ ] Monitor performance
- [ ] Track errors
