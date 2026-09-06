import { getSessionOrNull } from "./session";
import { redirect } from "next/navigation";
import { BACKEND_URL } from "@/constants/constants";

export interface FetchOptions extends RequestInit {
	headers?: Record<string, string>;
}

const isAuthFailure = (message: string) =>
	message.includes("invalid") ||
	message.includes("expired") ||
	message.includes("unauthorized");

/**
 * Exchange a refresh token for a fresh access token WITHOUT writing any cookies.
 *
 * authFetch is called from Server Component render paths (e.g. the /app layout
 * loading the user profile). Next.js forbids mutating cookies during render, so
 * calling the cookie-persisting refresh helper here throws and surfaces as a 500
 * immediately after sign-in. Cookie rotation is handled by middleware (proxy.ts);
 * here we only need a valid token for the in-flight retry.
 */
async function refreshAccessTokenNoPersist(
	refreshToken: string,
): Promise<string | null> {
	try {
		const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Cookie: `refreshToken=${refreshToken}`,
			},
			cache: "no-store",
		});
		if (!res.ok) return null;
		const data = (await res.json()) as { accessToken?: string };
		return data.accessToken ?? null;
	} catch {
		return null;
	}
}

export const authFetch = async (
	url: string | URL,
	options: FetchOptions = {},
) => {
	const session = await getSessionOrNull();

	// If no session, don't attempt the request - redirect immediately
	if (!session) {
		redirect("/auth/signin?reason=no_session");
	}

	// Always bypass the Next.js data cache for authenticated requests.
	// Every authFetch call is user-specific — caching would serve one user's
	// data to another user, or serve stale data after mutations.
	// This is the root cause of pages showing old data until hard-refresh.
	options = {
		cache: "no-store",
		...options,          // caller can still override if they explicitly need caching
	};

	const doFetch = (accessToken: string) =>
		fetch(url, {
			...options,
			headers: {
				...options.headers,
				Authorization: `Bearer ${accessToken}`,
			},
		});

	let response = await doFetch(session.accessToken);

	// On a 401, first try to silently refresh the access token using the
	// refresh token (both are 30-day tokens). Only if that fails do we treat
	// the session as genuinely dead and bounce to sign-in. This stops users
	// from being logged out "after some time" just because the short-lived
	// access token rotated between requests.
	if (response.status === 401) {
		const refreshed = await refreshAccessTokenNoPersist(session.refreshToken);

		if (refreshed) {
			response = await doFetch(refreshed);
			if (response.status !== 401) {
				return response;
			}
		}

		let reason: string | null = null;
		try {
			const errorData = await response.clone().json();
			const errorMessage = errorData?.message?.toLowerCase() || "";
			if (isAuthFailure(errorMessage)) {
				reason = "session_expired";
			}
		} catch {
			// If we can't parse the error, assume it's a genuine auth failure
			reason = "auth_error";
		}

		if (reason) {
			// Don't delete the session cookie here — this runs during render,
			// where cookie mutation throws. Middleware clears the stale cookie on
			// the next protected navigation; redirecting is enough.
			redirect(`/auth/signin?reason=${reason}`);
		}
	}

	return response;
};
