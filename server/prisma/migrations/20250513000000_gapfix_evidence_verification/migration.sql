-- Migration: Add verification fields to GapFixEvidence
-- Created: 2025-05-13
-- Description: Add verificationNotes, verifiedAt fields and status values for Gap Fix evidence verification system

-- Add verificationNotes field
ALTER TABLE "gap_fix_evidences" ADD COLUMN "verification_notes" TEXT;

-- Add verifiedAt field
ALTER TABLE "gap_fix_evidences" ADD COLUMN "verified_at" TIMESTAMP;

-- Update status column to support new verification values (pending, verified, rejected)
-- Note: existing values (uploaded, linked) will still work as they map to 'pending' verification status
-- This is a safe ALTER since we're not changing the column type, just the application logic