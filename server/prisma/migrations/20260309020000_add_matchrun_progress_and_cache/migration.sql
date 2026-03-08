-- AddColumn: progress tracking on match_runs
ALTER TABLE "match_runs" ADD COLUMN IF NOT EXISTS "progress" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex: allow efficient lookup of runs by status
CREATE INDEX IF NOT EXISTS "match_runs_status_idx" ON "match_runs"("status");

-- CreateTable: scrape-result cache keyed by (countries:major:level)
CREATE TABLE IF NOT EXISTS "data_source_meta" (
    "id" TEXT NOT NULL,
    "cache_key" VARCHAR(500) NOT NULL,
    "last_scraped_at" TIMESTAMP NOT NULL,
    "parser_version" VARCHAR(20) NOT NULL DEFAULT '1',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "data_source_meta_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "data_source_meta_cache_key_key" ON "data_source_meta"("cache_key");
