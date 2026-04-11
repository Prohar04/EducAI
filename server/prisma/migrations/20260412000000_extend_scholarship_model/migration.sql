-- AlterTable: extend scholarships with eligibility & display fields
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "amount" VARCHAR(200);
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "funding_type" VARCHAR(50);
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "min_gpa" REAL;
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "requires_english_test" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "financial_need_required" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "eligible_nationalities" JSONB;
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "tags" JSONB;
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "source_url" TEXT;
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "last_verified" TIMESTAMP;
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "scholarships_level_idx" ON "scholarships"("level");
CREATE INDEX IF NOT EXISTS "scholarships_is_active_idx" ON "scholarships"("is_active");
