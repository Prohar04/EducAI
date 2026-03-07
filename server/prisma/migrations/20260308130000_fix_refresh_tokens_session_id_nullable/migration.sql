-- Fix: session_id column on refresh_tokens was NOT NULL with no default.
-- Prisma's INSERT never includes this stale column (not in schema), causing
-- every saveRefreshToken() call to fail with a NOT NULL constraint violation,
-- which the googleAuthCallback catch block silently converted to oauth_failed.
-- Applied directly to Neon: ALTER TABLE refresh_tokens ALTER COLUMN session_id DROP NOT NULL;

ALTER TABLE "refresh_tokens" ALTER COLUMN "session_id" DROP NOT NULL;
