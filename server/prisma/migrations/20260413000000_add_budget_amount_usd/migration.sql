-- Add canonical USD-normalized budget field for matching/filtering logic.
-- Populated by the application layer whenever budgetMax or budgetCurrency changes.
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "budget_amount_usd" REAL;
