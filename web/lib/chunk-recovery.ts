/**
 * A deploy replaces the hashed chunk files on the CDN. A tab still running the
 * previous build then asks for a chunk that no longer exists and React unmounts
 * the tree — the user sees a blank "Application error" screen with no way out.
 *
 * The page is not broken, it is simply stale: one reload onto the current build
 * fixes it. We reload at most once per session so a genuinely missing chunk
 * cannot turn into a refresh loop.
 */
const RELOAD_FLAG = "educai:chunk-reload";

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const name = (error as Error).name ?? "";
  const message = (error as Error).message ?? "";
  return (
    name === "ChunkLoadError" ||
    /Loading chunk [\w-]+ failed/i.test(message) ||
    /Failed to load chunk/i.test(message) ||
    /error loading dynamically imported module/i.test(message)
  );
}

/** Returns true when a recovery reload was started. */
export function recoverFromChunkError(error: unknown): boolean {
  if (typeof window === "undefined") return false;
  if (!isChunkLoadError(error)) return false;

  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return false;
    sessionStorage.setItem(RELOAD_FLAG, "1");
  } catch {
    // Private mode or blocked storage — reloading once is still the right call.
  }

  window.location.reload();
  return true;
}

export function clearChunkRecoveryFlag(): void {
  try {
    sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
    /* nothing to clear */
  }
}
