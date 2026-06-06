"use client";

import useSWR, { type SWRResponse } from "swr";
import { BACKEND_URL } from "@/constants/constants";

interface ApiError extends Error {
  status?: number;
  info?: unknown;
}

/**
 * Custom SWR hook with authenticated fetching
 *
 * This hook wraps useSWR and provides:
 * - Automatic authentication via cookies (session cookie is sent automatically)
 * - Proper error handling
 * - TypeScript type safety
 *
 * @param key - SWR cache key (endpoint path or null to skip fetching)
 * @returns SWR response with data, error, isLoading, and mutate
 */
export function useSwrAuth<T = unknown>(
  key: string | null
): SWRResponse<T, Error> {
  return useSWR<T, Error>(
    key,
    async (url: string) => {
      // Fetch with credentials to include session cookie
      const response = await fetch(`${BACKEND_URL}${url}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Handle non-OK responses
      if (!response.ok) {
        const error: ApiError = new Error(`API error: ${response.status}`);
        error.status = response.status;
        error.info = await response.json().catch(() => null);
        throw error;
      }

      return response.json();
    },
    {
      // Inherit global swrConfig — don't override here so the fix in
      // lib/swr/config.ts (revalidateOnMount: true, dedupingInterval: 0)
      // applies to all callers of this hook automatically.
    }
  );
}
