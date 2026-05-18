import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import logger from '#src/config/logger.ts';

const BUCKET_NAME = process.env.SUPABASE_EVIDENCE_BUCKET || 'evidence';
const SIGNED_URL_TTL_SECONDS = 604800; // 7 days

let _client: SupabaseClient | null = null;
let _configured = false;

function getClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    if (!_configured) {
      logger.warn('[supabase] SUPABASE_URL or SUPABASE_SERVICE_KEY not configured. Upload will fail.');
      _configured = true;
    }
    return null;
  }

  if (!_client) {
    _client = createClient(url, key);
  }
  return _client;
}

export function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}

/**
 * Upload a PDF to Supabase private storage.
 * Returns { signedUrl, storagePath } — store storagePath in DB for re-signing later.
 * The signed URL is valid for SIGNED_URL_TTL_SECONDS (7 days by default).
 */
export async function uploadEvidencePDF(
  userId: string,
  evidenceId: string,
  fileBuffer: Buffer,
  fileName: string
): Promise<{ signedUrl: string; storagePath: string }> {
  const supabase = getClient();

  if (!supabase) {
    throw new Error('Evidence storage is currently unavailable. Please try again later or contact support if the problem persists.');
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const storagePath = `gap-evidence/${userId}/${evidenceId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, { contentType: 'application/pdf', upsert: true });

  if (uploadError) throw new Error(`Supabase upload failed: ${uploadError.message}`);

  const { data: signedData, error: signError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (signError || !signedData?.signedUrl) {
    throw new Error(`Failed to generate signed URL: ${signError?.message ?? 'unknown error'}`);
  }

  return { signedUrl: signedData.signedUrl, storagePath };
}

/**
 * Generate a fresh signed URL for an already-uploaded evidence file.
 * Call this when the stored signed URL has expired.
 */
export async function generateSignedUrl(storagePath: string): Promise<string> {
  const supabase = getClient();

  if (!supabase) {
    throw new Error('Evidence storage is currently unavailable. Please contact support.');
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to generate signed URL: ${error?.message ?? 'unknown error'}`);
  }

  return data.signedUrl;
}

export async function deleteEvidencePDF(storagePath: string): Promise<void> {
  const supabase = getClient();
  if (!supabase) {
    logger.warn('[supabase] Cannot delete - storage not configured');
    return;
  }
  try {
    await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
  } catch {
    // Non-fatal: file may already be deleted
  }
}
