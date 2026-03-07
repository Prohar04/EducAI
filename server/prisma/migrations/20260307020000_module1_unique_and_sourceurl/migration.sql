-- Module 1: add sourceUrl fields + unique constraints for safe upsert
-- NOTE: If duplicate (country_id, name) or (university_id, title, level) rows
--       already exist this migration will fail. Deduplicate first if needed.

-- AlterTable: add source_url to universities
ALTER TABLE "universities" ADD COLUMN "source_url" TEXT;

-- AlterTable: add source_url to programs
ALTER TABLE "programs" ADD COLUMN "source_url" TEXT;

-- CreateIndex: unique (country_id, name) on universities
CREATE UNIQUE INDEX "universities_country_id_name_key" ON "universities"("country_id", "name");

-- CreateIndex: unique (university_id, title, level) on programs
CREATE UNIQUE INDEX "programs_university_id_title_level_key" ON "programs"("university_id", "title", "level");
