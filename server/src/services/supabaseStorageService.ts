import { createClient } from "@supabase/supabase-js"

function getClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY required")
  return createClient(url, key)
}

export async function uploadEvidencePDF(
  userId: string,
  evidenceId: string,
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  const supabase = getClient()
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_")
  const path = `gap-evidence/${userId}/${evidenceId}/${Date.now()}-${safeName}`

  const { error } = await supabase.storage
    .from("evidence")
    .upload(path, fileBuffer, { contentType: "application/pdf", upsert: true })

  if (error) throw new Error(`Supabase upload failed: ${error.message}`)

  const { data } = supabase.storage.from("evidence").getPublicUrl(path)
  return data.publicUrl
}

export async function deleteEvidencePDF(publicUrl: string): Promise<void> {
  const supabase = getClient()
  try {
    const url = new URL(publicUrl)
    const path = url.pathname.split("/object/public/evidence/")[1]
    if (!path) return
    await supabase.storage.from("evidence").remove([path])
  } catch {
    // Non-fatal: file may not be in Supabase
  }
}
