import { getSessionOrNull, deleteSession } from "./session";
import { redirect } from "next/navigation";

export interface FetchOptions extends RequestInit {
	headers?: Record<string, string>;
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

	options.headers = {
		...options.headers,
		Authorization: `Bearer ${session.accessToken}`,
	};

	const response = await fetch(url, options);

	if (response.status === 401) {
		// 401 could mean expired token or invalid session
		// Check if the error response indicates a specific issue
		try {
			const errorData = await response.clone().json();
			const errorMessage = errorData?.message?.toLowerCase() || "";

			// Only delete session and redirect if it's a genuine auth failure
			// Not for temporary network issues or rate limits
			if (errorMessage.includes("invalid") || errorMessage.includes("expired") || errorMessage.includes("unauthorized")) {
				await deleteSession();
				redirect("/auth/signin?reason=session_expired");
			}
		} catch {
			// If we can't parse the error, assume it's a genuine auth failure
			await deleteSession();
			redirect("/auth/signin?reason=auth_error");
		}
	}

	return response;
};

