-- Add intended abroad program fields to user_profiles
-- These are separate from majorOrTrack (current major) to distinguish
-- what the user currently studies vs. what they want to study abroad.

ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "intended_abroad_major" VARCHAR(100);
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "career_goal" VARCHAR(200);
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "research_interest" VARCHAR(200);
