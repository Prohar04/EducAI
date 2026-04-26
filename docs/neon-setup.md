# Neon Setup — Production PostgreSQL

## Why Neon
- Serverless PostgreSQL — auto-scales to zero, no idle charges
- Free tier: 0.5 GB storage, 1 active compute, unlimited databases
- Prisma compatible via `@prisma/adapter-pg`
- Built-in connection pooling (pgBouncer)
- Database branching for staging/preview

## Step-by-step

### 1. Create Neon project
1. Go to neon.tech → New Project
2. Project name: `educai`
3. PostgreSQL version: 16
4. Region: US West (Oregon) — matches Render services

### 2. Get connection strings
In Neon dashboard → Connection Details:
- Select **Pooled connection** (recommended for serverless/Render)
- Copy the connection string — looks like:
  ```
  postgresql://educai_owner:xxxx@ep-xxx.us-west-2.aws.neon.tech/educai?sslmode=require
  ```

**Use the pooled connection URL** as `DATABASE_URL` for both Express and FastAPI. The Express `database.ts` config already adds keepAlive and timeout settings on top of the PrismaPg adapter.

The FastAPI `prisma_connect.py` also appends `pgbouncer=true&connect_timeout=30&connection_limit=1` which is required for Neon's transaction-mode pgBouncer.

### 3. Set DATABASE_URL
Set this value as `DATABASE_URL` in:
- Render → educai-api → Environment
- Render → educai-ai → Environment

### 4. Run migrations (first deploy)

#### Via Render Shell (recommended)
1. Open Render → educai-api service → Shell
2. Run:
```bash
npx prisma migrate deploy
```

This runs all pending migrations from `server/prisma/migrations/` against the Neon database.

#### Via local machine (with Neon URL)
```bash
cd server
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

**Never run `prisma migrate dev` against the production Neon database.** The `db:migrate:dev` script includes a guard (`assert-safe-db.ts`) that blocks this.

### 5. Seed reference data (optional, one-time)

After migrations, seed visa templates and scholarships:
```bash
# Via Render Shell
DATABASE_URL="..." npx tsx prisma/seedVisaTemplates.ts
DATABASE_URL="..." npx tsx prisma/seedScholarships.ts
```

Or set `DATABASE_URL` in your local `.env` pointing at Neon:
```bash
cd server
npm run seed:visa
npm run seed:scholarships
```

### 6. Verify schema
```bash
# Via Render Shell or locally with production DATABASE_URL
curl https://educai-api.onrender.com/health/schema
```
Should return `{ "ok": true, "tables": { ... } }`.

## Connection priority in code

`server/src/config/database.ts` resolves connection in this order:
1. `DATABASE_URL` (Render/Neon standard — use this)
2. `DATABASE_URL_LOCAL` (dev docker)
3. `DATABASE_URL_CLOUD` (legacy override)

`server/prisma.config.ts` follows the same priority for `prisma migrate`.

## Database branching (recommended for staging)
Neon supports database branching — create a `staging` branch from `main` for your staging environment. Each Render preview environment can point to its own Neon branch.

## Backup
Neon automatically takes daily backups on paid plans. On the free tier, use `pg_dump` periodically:
```bash
pg_dump "postgresql://..." > backup-$(date +%Y%m%d).sql
```
