"use client";

import type { SWRConfiguration } from "swr";

/**
 * Global SWR configuration for EducAI
 *
 * Tuned to prevent stale data on navigation:
 * - revalidateOnMount: true  — always fetch fresh data when a component mounts,
 *   even if SWR already has a cached value from a previous visit.
 * - revalidateOnFocus: true  — re-fetch when the user returns to the tab, so
 *   data updated in another tab/window is always reflected.
 * - keepPreviousData: false  — show a loading state rather than stale data.
 *   (keepPreviousData: true was the root cause of the "old data on navigation"
 *   bug: SWR served the prior visit's response while silently re-fetching.)
 * - dedupingInterval: 0  — no request deduplication window; every navigation
 *   triggers a fresh request. (Previous value of 5000 ms meant a page visited
 *   within 5 s of the previous visit served cached data with no re-fetch.)
 */
export const swrConfig: SWRConfiguration = {
  // Always fetch when component mounts — never serve stale cache on navigation
  revalidateOnMount: true,

  // Re-fetch when user switches back to the tab
  revalidateOnFocus: true,

  // Re-fetch when user reconnects to internet
  revalidateOnReconnect: true,

  // No deduplication window — every mount triggers a real request
  dedupingInterval: 0,

  // Show loading state instead of stale data while revalidating
  keepPreviousData: false,

  // Retry on error with exponential backoff
  errorRetryCount: 3,
  errorRetryInterval: 1000,

  // Always consider cached data stale (so revalidateOnMount always fires)
  revalidateIfStale: true,

  // Throttle focus revalidation to at most once per 10 s to avoid hammering
  // the API on rapid tab switches
  focusThrottleInterval: 10000,
};

export default swrConfig;
