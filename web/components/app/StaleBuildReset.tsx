"use client";

import { useEffect } from "react";
import { clearChunkRecoveryFlag } from "@/lib/chunk-recovery";

/**
 * Clears the stale-build reload budget once the app has actually rendered.
 *
 * Without this the budget is spent for the lifetime of the tab: three deploys
 * over a long session would exhaust it and the fourth would surface a raw error
 * instead of recovering. Reaching this component means the current build
 * loaded, so the next deploy starts from a clean budget.
 */
export function StaleBuildReset() {
  useEffect(() => {
    clearChunkRecoveryFlag();
  }, []);

  return null;
}
