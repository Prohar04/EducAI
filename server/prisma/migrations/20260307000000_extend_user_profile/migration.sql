-- Extend user_profiles with new international-student onboarding fields
-- Step 1: Student Stage
ALTER TABLE "user_profiles" ADD COLUMN "current_stage" VARCHAR(50);
ALTER TABLE "user_profiles" ADD COLUMN "target_intake" VARCHAR(30);
ALTER TABLE "user_profiles" ADD COLUMN "target_countries" JSONB;
ALTER TABLE "user_profiles" ADD COLUMN "intended_level" VARCHAR(20);

-- Step 2: Academic Profile
ALTER TABLE "user_profiles" ADD COLUMN "current_institution" VARCHAR(200);
ALTER TABLE "user_profiles" ADD COLUMN "major_or_track" VARCHAR(100);
ALTER TABLE "user_profiles" ADD COLUMN "gpa_scale" VARCHAR(10);
ALTER TABLE "user_profiles" ADD COLUMN "graduation_year" INTEGER;
ALTER TABLE "user_profiles" ADD COLUMN "backlogs" INTEGER;
ALTER TABLE "user_profiles" ADD COLUMN "work_experience_months" INTEGER;

-- Step 3: Tests & Language
ALTER TABLE "user_profiles" ADD COLUMN "english_test_type" VARCHAR(20);
ALTER TABLE "user_profiles" ADD COLUMN "english_score" REAL;
ALTER TABLE "user_profiles" ADD COLUMN "gre" REAL;
ALTER TABLE "user_profiles" ADD COLUMN "gmat" REAL;

-- Step 4: Budget & Preferences
ALTER TABLE "user_profiles" ADD COLUMN "budget_currency" VARCHAR(10) DEFAULT 'USD';
ALTER TABLE "user_profiles" ADD COLUMN "budget_max" REAL;
ALTER TABLE "user_profiles" ADD COLUMN "funding_need" BOOLEAN;
ALTER TABLE "user_profiles" ADD COLUMN "preferred_cities" JSONB;
ALTER TABLE "user_profiles" ADD COLUMN "priorities" JSONB;
