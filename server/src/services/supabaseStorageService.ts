import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _client: SupabaseClient | null = null;
let _configured = false;

function getClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    if (!_configured) {
      console.warn('[supabase] SUPABASE_URL or SUPABASE_SERVICE_KEY not configured. Upload will fail.');
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

export async function uploadEvidencePDF(
  userId: string,
  evidenceId: string,
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  const supabase = getClient();

  if (!supabase) {
    throw new Error('Supabase storage is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.');
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `gap-evidence/${userId}/${evidenceId}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from('evidence')
    .upload(path, fileBuffer, { contentType: 'application/pdf', upsert: true });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = supabase.storage.from('evidence').getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteEvidencePDF(publicUrl: string): Promise<void> {
  const supabase = getClient();
  if (!supabase) {
    console.warn('[supabase] Cannot delete - storage not configured');
    return;
  }
  try {
    const url = new URL(publicUrl);
    const path = url.pathname.split('/object/public/evidence/')[1];
    if (!path) return;
    await supabase.storage.from('evidence').remove([path]);
  } catch {
    // Non-fatal: file may not be in Supabase
  }
}
