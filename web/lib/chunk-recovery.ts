/**
 * A deploy replaces the hashed chunk files on the CDN and regenerates the id of
 * every Server Action. A tab still running the previous build then asks for
 * something the current deployment has never heard of, React unmounts the tree,
 * and the user gets a blank error screen with no indication that the page is
 * merely stale.
 *
 * The page is not broken — one reload onto the current build fixes it. Reloads
 * are capped so a genuinely missing asset cannot become a refresh loop, but the
 * cap allows more than one because several deploys can land in a single sitting
 * and each is independently recoverable.
 */
const RELOAD_COUNT_KEY = "educai:staleBuildReloads";
const MAX_RELOADS = 3;

export function isStaleBuildError(error: unknown): boolean {
  if (!error) return false;
  const name = (error as Error).name ?? "";
  const message = (error as Error).message ?? "";

  return (
    // Code-split chunk that no longer exists on the CDN.
    name === "ChunkLoadError" ||
    /Loading chunk [\w-]+ failed/i.test(message) ||
    /Failed to load chunk/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    // Server Action id from a previous build. Next.js regenerates these on
    // every build, so any open tab loses them the moment a deploy lands.
    name === "UnrecognizedActionError" ||
    /Server Action .* was not found on the server/i.test(message) ||
    /Failed to find Server Action/i.test(message)
  );
}

/** Kept for callers that only care about chunk failures. */
export function isChunkLoadError(error: unknown): boolean {
  return isStaleBuildError(error);
}

function readReloadCount(): number {
  try {
    return Number(sessionStorage.getItem(RELOAD_COUNT_KEY) ?? "0") || 0;
  } catch {
    // Private mode or blocked storage — treat as a first attempt.
    return 0;
  }
}

/** Returns true when a recovery reload was started. */
export function recoverFromChunkError(error: unknown): boolean {
  if (typeof window === "undefined") return false;
  if (!isStaleBuildError(error)) return false;

  const attempts = readReloadCount();
  if (attempts >= MAX_RELOADS) return false;

  try {
    sessionStorage.setItem(RELOAD_COUNT_KEY, String(attempts + 1));
  } catch {
    // Reloading once is still the right call even if the count cannot persist.
  }

  window.location.reload();
  return true;
}

/**
 * Call once the app has rendered successfully, so a later deploy starts from a
 * fresh budget instead of inheriting attempts from earlier in the session.
 */
export function clearChunkRecoveryFlag(): void {
  try {
    sessionStorage.removeItem(RELOAD_COUNT_KEY);
  } catch {
    /* nothing to clear */
  }
}

const SOFT_RELOAD_KEY = "educai:softReloadAt";
const SOFT_RELOAD_COOLDOWN_MS = 30_000;

/**
 * Last resort for an *unrecognised* client error that a plain reload very often
 * clears: a stale RSC payload or Server Action id after a deploy, a hydration
 * desync, or a chunk failure that surfaced without a recognisable name. These
 * all present as "works after I refresh".
 *
 * Reloads at most once per cooldown window (self-contained — no dependency on a
 * success flag being cleared), so a genuinely deterministic error reloads once
 * and then falls through to the visible error boundary instead of looping.
 */
export function recoverWithSoftReload(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const last = Number(sessionStorage.getItem(SOFT_RELOAD_KEY) ?? "0") || 0;
    if (Date.now() - last < SOFT_RELOAD_COOLDOWN_MS) return false;
    sessionStorage.setItem(SOFT_RELOAD_KEY, String(Date.now()));
  } catch {
    // Storage blocked — cannot guarantee we won't loop, so don't reload.
    return false;
  }

  window.location.reload();
  return true;
}
