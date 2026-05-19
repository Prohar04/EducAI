-- CreateTable: news_cache
-- Stores AI-fetched news articles per category so they survive across serverless invocations.
CREATE TABLE IF NOT EXISTS "news_cache" (
    "id" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "articles" JSONB NOT NULL,
    "fetched_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "news_cache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "news_cache_category_key" ON "news_cache"("category");
CREATE INDEX IF NOT EXISTS "news_cache_category_idx" ON "news_cache"("category");
CREATE INDEX IF NOT EXISTS "news_cache_fetched_at_idx" ON "news_cache"("fetched_at");
