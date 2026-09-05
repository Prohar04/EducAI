-- Migration: Add actionSteps to GapFixItem
-- Created: 2026-09-06
-- Description: Stores a JSON array of concrete "what to do" steps generated during
-- gap analysis / re-analysis so the UI can show the student actionable guidance.

ALTER TABLE "gap_fix_items" ADD COLUMN IF NOT EXISTS "actionSteps" TEXT;
