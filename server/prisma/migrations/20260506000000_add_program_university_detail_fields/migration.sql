-- Add extended detail fields to universities
ALTER TABLE "universities" ADD COLUMN IF NOT EXISTS "ranking" VARCHAR(200);
ALTER TABLE "universities" ADD COLUMN IF NOT EXISTS "university_type" VARCHAR(50);
ALTER TABLE "universities" ADD COLUMN IF NOT EXISTS "admissions_url" TEXT;
ALTER TABLE "universities" ADD COLUMN IF NOT EXISTS "tuition_url" TEXT;
ALTER TABLE "universities" ADD COLUMN IF NOT EXISTS "scholarships_url" TEXT;
ALTER TABLE "universities" ADD COLUMN IF NOT EXISTS "international_url" TEXT;
ALTER TABLE "universities" ADD COLUMN IF NOT EXISTS "application_portal_url" TEXT;
ALTER TABLE "universities" ADD COLUMN IF NOT EXISTS "last_verified_at" TIMESTAMP;

-- Add extended detail fields to programs
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "application_fee_usd" INTEGER;
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "study_mode" VARCHAR(50);
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "language_of_instruction" VARCHAR(100);
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "application_portal_url" TEXT;
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "last_verified_at" TIMESTAMP;
