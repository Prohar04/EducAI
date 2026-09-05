import { getSessionOrNull, deleteSession } from "./session";
import { refreshToken as refreshAccessToken } from "./auth";
import { redirect } from "next/navigation";

export interface FetchOptions extends RequestInit {
	headers?: Record<string, string>;
}

const isAuthFailure = (message: string) =>
	message.includes("invalid") ||
	message.includes("expired") ||
	message.includes("unauthorized");

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
		const refreshed = await refreshAccessToken(session.refreshToken).catch(
			() => null,
		);

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
			await deleteSession();
			redirect(`/auth/signin?reason=${reason}`);
		}
	}

	return response;
};
