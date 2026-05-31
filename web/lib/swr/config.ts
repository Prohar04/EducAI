"use client";

import type { SWRConfiguration } from "swr";

/**
 * Global SWR configuration for EducAI
 *
 * This configuration provides:
 * - Automatic revalidation on focus (disabled by default to reduce API calls)
 * - Revalidation on network reconnection
 * - Deduplication of requests within 5 seconds
 * - Error retry with exponential backoff
 * - Keep previous data while revalidating (prevents flickering)
 */
export const swrConfig: SWRConfiguration = {
  // Don't revalidate on every tab focus to reduce unnecessary API calls
  revalidateOnFocus: false,

  // Revalidate when user reconnects to internet
  revalidateOnReconnect: true,

  // Deduplicate requests within 5 seconds
  dedupingInterval: 5000,

  // Keep previous data while revalidating to prevent UI flickering
  keepPreviousData: true,

  // Retry on error with exponential backoff
  errorRetryCount: 3,
  errorRetryInterval: 1000,

  // Show stale data while revalidating
  revalidateIfStale: true,

  // Cache data for 60 seconds before considering it stale
  focusThrottleInterval: 60000,
};

export default swrConfig;
