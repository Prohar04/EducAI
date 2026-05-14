-- AddColumn: gap_fix_items.pdf_storage_path
-- Stores the Supabase object path so signed URLs can be regenerated after expiry.
ALTER TABLE "gap_fix_items" ADD COLUMN IF NOT EXISTS "pdf_storage_path" TEXT;
