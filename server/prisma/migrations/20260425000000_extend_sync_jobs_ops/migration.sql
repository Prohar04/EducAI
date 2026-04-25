-- Extend sync_jobs with raw logs, queue state, crawler details, and stack traces
-- for professional data operations dashboard

ALTER TABLE "sync_jobs" ADD COLUMN IF NOT EXISTS "raw_logs" TEXT;
ALTER TABLE "sync_jobs" ADD COLUMN IF NOT EXISTS "queue_state" VARCHAR(50);
ALTER TABLE "sync_jobs" ADD COLUMN IF NOT EXISTS "crawler_details" JSONB;
ALTER TABLE "sync_jobs" ADD COLUMN IF NOT EXISTS "stack_trace" TEXT;
