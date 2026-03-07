-- ============================================================
-- Catch-up migration: reconcile schema drift.
-- Migrations 8-10 were marked applied but their SQL was never
-- executed against this database instance, so this migration
-- re-applies all missing changes with safe IF NOT EXISTS guards.
-- ============================================================

-- ── Migration 8 catch-up: drop obsolete clothing-domain tables ──────

ALTER TABLE IF EXISTS "events"             DROP CONSTRAINT IF EXISTS "events_user_id_fkey";
ALTER TABLE IF EXISTS "garments"           DROP CONSTRAINT IF EXISTS "garments_user_id_fkey";
ALTER TABLE IF EXISTS "outfit_items"       DROP CONSTRAINT IF EXISTS "outfit_items_garment_id_fkey";
ALTER TABLE IF EXISTS "outfit_items"       DROP CONSTRAINT IF EXISTS "outfit_items_outfit_id_fkey";
ALTER TABLE IF EXISTS "outfits"            DROP CONSTRAINT IF EXISTS "outfits_event_id_fkey";
ALTER TABLE IF EXISTS "outfits"            DROP CONSTRAINT IF EXISTS "outfits_event_id_fkey";
ALTER TABLE IF EXISTS "outfits"            DROP CONSTRAINT IF EXISTS "outfits_user_id_fkey";
ALTER TABLE IF EXISTS "processing_jobs"    DROP CONSTRAINT IF EXISTS "processing_jobs_user_id_fkey";
ALTER TABLE IF EXISTS "recommendation_logs" DROP CONSTRAINT IF EXISTS "recommendation_logs_event_id_fkey";
ALTER TABLE IF EXISTS "recommendation_logs" DROP CONSTRAINT IF EXISTS "recommendation_logs_user_id_fkey";
ALTER TABLE IF EXISTS "tryon_results"      DROP CONSTRAINT IF EXISTS "tryon_results_body_image_id_fkey";
ALTER TABLE IF EXISTS "tryon_results"      DROP CONSTRAINT IF EXISTS "tryon_results_outfit_id_fkey";
ALTER TABLE IF EXISTS "tryon_results"      DROP CONSTRAINT IF EXISTS "tryon_results_user_id_fkey";
ALTER TABLE IF EXISTS "user_body_images"   DROP CONSTRAINT IF EXISTS "user_body_images_user_id_fkey";
ALTER TABLE IF EXISTS "user_preferences"   DROP CONSTRAINT IF EXISTS "user_preferences_user_id_fkey";

DROP TABLE IF EXISTS "content_moderation";
DROP TABLE IF EXISTS "events";
DROP TABLE IF EXISTS "garments";
DROP TABLE IF EXISTS "outfit_items";
DROP TABLE IF EXISTS "outfits";
DROP TABLE IF EXISTS "processing_jobs";
DROP TABLE IF EXISTS "recommendation_logs";
DROP TABLE IF EXISTS "system_metrics";
DROP TABLE IF EXISTS "tryon_results";
DROP TABLE IF EXISTS "user_body_images";
DROP TABLE IF EXISTS "user_preferences";

DROP TYPE IF EXISTS "job_status";
DROP TYPE IF EXISTS "job_type";
DROP TYPE IF EXISTS "moderation_status";

CREATE TABLE IF NOT EXISTS "user_profiles" (
    "user_id" UUID NOT NULL,
    "target_country" VARCHAR(100),
    "level" VARCHAR(20),
    "budget_range" VARCHAR(50),
    "intended_major" VARCHAR(100),
    "gpa" REAL,
    "test_scores" JSONB,
    "onboarding_done" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id")
);

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_user_id_fkey'
    ) THEN
        ALTER TABLE "user_profiles"
            ADD CONSTRAINT "user_profiles_user_id_fkey"
            FOREIGN KEY ("user_id") REFERENCES "users"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ── Migration 9 catch-up: create edu-domain tables ───────────────────

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProgramLevel') THEN
        CREATE TYPE "ProgramLevel" AS ENUM ('BSC', 'MSC', 'PHD');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "countries" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "universities" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "country_id" TEXT NOT NULL,
    "city" VARCHAR(100),
    "website" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "programs" (
    "id" TEXT NOT NULL,
    "university_id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "field" VARCHAR(100) NOT NULL,
    "level" "ProgramLevel" NOT NULL,
    "duration_months" INTEGER,
    "tuition_min_usd" INTEGER,
    "tuition_max_usd" INTEGER,
    "description" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "program_requirements" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "key" VARCHAR(50) NOT NULL,
    "value" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "program_requirements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "program_deadlines" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "term" VARCHAR(50) NOT NULL,
    "deadline" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "program_deadlines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "saved_programs" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "program_id" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_programs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "countries_code_key"                  ON "countries"("code");
CREATE INDEX        IF NOT EXISTS "universities_country_id_idx"         ON "universities"("country_id");
CREATE INDEX        IF NOT EXISTS "universities_name_idx"               ON "universities"("name");
CREATE INDEX        IF NOT EXISTS "programs_university_id_idx"          ON "programs"("university_id");
CREATE INDEX        IF NOT EXISTS "programs_field_idx"                  ON "programs"("field");
CREATE INDEX        IF NOT EXISTS "programs_level_idx"                  ON "programs"("level");
CREATE INDEX        IF NOT EXISTS "programs_title_idx"                  ON "programs"("title");
CREATE INDEX        IF NOT EXISTS "program_requirements_program_id_idx" ON "program_requirements"("program_id");
CREATE INDEX        IF NOT EXISTS "program_deadlines_program_id_idx"    ON "program_deadlines"("program_id");
CREATE INDEX        IF NOT EXISTS "saved_programs_user_id_idx"          ON "saved_programs"("user_id");
CREATE INDEX        IF NOT EXISTS "saved_programs_program_id_idx"       ON "saved_programs"("program_id");
CREATE UNIQUE INDEX IF NOT EXISTS "saved_programs_user_id_program_id_key" ON "saved_programs"("user_id", "program_id");

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'universities_country_id_fkey') THEN
        ALTER TABLE "universities" ADD CONSTRAINT "universities_country_id_fkey"
            FOREIGN KEY ("country_id") REFERENCES "countries"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'programs_university_id_fkey') THEN
        ALTER TABLE "programs" ADD CONSTRAINT "programs_university_id_fkey"
            FOREIGN KEY ("university_id") REFERENCES "universities"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'program_requirements_program_id_fkey') THEN
        ALTER TABLE "program_requirements" ADD CONSTRAINT "program_requirements_program_id_fkey"
            FOREIGN KEY ("program_id") REFERENCES "programs"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'program_deadlines_program_id_fkey') THEN
        ALTER TABLE "program_deadlines" ADD CONSTRAINT "program_deadlines_program_id_fkey"
            FOREIGN KEY ("program_id") REFERENCES "programs"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'saved_programs_user_id_fkey') THEN
        ALTER TABLE "saved_programs" ADD CONSTRAINT "saved_programs_user_id_fkey"
            FOREIGN KEY ("user_id") REFERENCES "users"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'saved_programs_program_id_fkey') THEN
        ALTER TABLE "saved_programs" ADD CONSTRAINT "saved_programs_program_id_fkey"
            FOREIGN KEY ("program_id") REFERENCES "programs"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ── Migration 10 catch-up: extend user_profiles ──────────────────────

ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "current_stage"          VARCHAR(50);
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "target_intake"           VARCHAR(30);
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "target_countries"        JSONB;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "intended_level"          VARCHAR(20);
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "current_institution"     VARCHAR(200);
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "major_or_track"          VARCHAR(100);
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "gpa_scale"               VARCHAR(10);
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "graduation_year"         INTEGER;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "backlogs"                INTEGER;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "work_experience_months"  INTEGER;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "english_test_type"       VARCHAR(20);
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "english_score"           REAL;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "gre"                     REAL;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "gmat"                    REAL;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "budget_currency"         VARCHAR(10) DEFAULT 'USD';
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "budget_max"              REAL;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "funding_need"            BOOLEAN;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "preferred_cities"        JSONB;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "priorities"              JSONB;

-- ── Migration 11 original: sourceUrl fields + unique-upsert indexes ──

ALTER TABLE "universities" ADD COLUMN IF NOT EXISTS "source_url" TEXT;
ALTER TABLE "programs"     ADD COLUMN IF NOT EXISTS "source_url" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "universities_country_id_name_key"
    ON "universities"("country_id", "name");

CREATE UNIQUE INDEX IF NOT EXISTS "programs_university_id_title_level_key"
    ON "programs"("university_id", "title", "level");
