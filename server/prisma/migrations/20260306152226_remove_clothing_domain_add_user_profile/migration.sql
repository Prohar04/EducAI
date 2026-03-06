/*
  Warnings:

  - You are about to drop the `content_moderation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `garments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `outfit_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `outfits` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `processing_jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recommendation_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_metrics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tryon_results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_body_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_preferences` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_user_id_fkey";

-- DropForeignKey
ALTER TABLE "garments" DROP CONSTRAINT "garments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "outfit_items" DROP CONSTRAINT "outfit_items_garment_id_fkey";

-- DropForeignKey
ALTER TABLE "outfit_items" DROP CONSTRAINT "outfit_items_outfit_id_fkey";

-- DropForeignKey
ALTER TABLE "outfits" DROP CONSTRAINT "outfits_event_id_fkey";

-- DropForeignKey
ALTER TABLE "outfits" DROP CONSTRAINT "outfits_user_id_fkey";

-- DropForeignKey
ALTER TABLE "processing_jobs" DROP CONSTRAINT "processing_jobs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "recommendation_logs" DROP CONSTRAINT "recommendation_logs_event_id_fkey";

-- DropForeignKey
ALTER TABLE "recommendation_logs" DROP CONSTRAINT "recommendation_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "tryon_results" DROP CONSTRAINT "tryon_results_body_image_id_fkey";

-- DropForeignKey
ALTER TABLE "tryon_results" DROP CONSTRAINT "tryon_results_outfit_id_fkey";

-- DropForeignKey
ALTER TABLE "tryon_results" DROP CONSTRAINT "tryon_results_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_body_images" DROP CONSTRAINT "user_body_images_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_preferences" DROP CONSTRAINT "user_preferences_user_id_fkey";

-- DropTable
DROP TABLE "content_moderation";

-- DropTable
DROP TABLE "events";

-- DropTable
DROP TABLE "garments";

-- DropTable
DROP TABLE "outfit_items";

-- DropTable
DROP TABLE "outfits";

-- DropTable
DROP TABLE "processing_jobs";

-- DropTable
DROP TABLE "recommendation_logs";

-- DropTable
DROP TABLE "system_metrics";

-- DropTable
DROP TABLE "tryon_results";

-- DropTable
DROP TABLE "user_body_images";

-- DropTable
DROP TABLE "user_preferences";

-- DropEnum
DROP TYPE "job_status";

-- DropEnum
DROP TYPE "job_type";

-- DropEnum
DROP TYPE "moderation_status";

-- CreateTable
CREATE TABLE "user_profiles" (
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

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
