"use client";

import useSWR, { type SWRResponse } from "swr";
import { BACKEND_URL } from "@/constants/constants";

interface ApiError extends Error {
  status?: number;
  info?: unknown;
}

function getStoredAccessToken(): string | null {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
}

/**
 * Custom SWR hook with authenticated fetching
 *
 * This hook wraps useSWR and provides:
 * - Automatic authentication via cookies (session cookie is sent automatically)
 * - A localStorage-token fallback when the cookie request fails (network
 *   error, or a 401 — e.g. third-party cookies blocked, cross-origin cookie
 *   dropped) so the request gets a second try with an Authorization header
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
      const fetchOnce = (extraHeaders?: Record<string, string>) =>
        fetch(`${BACKEND_URL}${url}`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...extraHeaders,
          },
        });

      let response: Response;
      try {
        response = await fetchOnce();
      } catch (networkError) {
        // The cookie-based request couldn't even complete — fall back to a
        // token from localStorage if we have one, otherwise rethrow.
        const token = getStoredAccessToken();
        if (!token) throw networkError;
        response = await fetchOnce({ Authorization: `Bearer ${token}` });
      }

      if (response.status === 401) {
        // Cookie auth was rejected — retry once with the mirrored token.
        const token = getStoredAccessToken();
        if (token) {
          response = await fetchOnce({ Authorization: `Bearer ${token}` });
        }
      }

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
