import { getSession, deleteSession } from "./session";
import { redirect } from "next/navigation";

export interface FetchOptions extends RequestInit {
	headers?: Record<string, string>;
}

export const authFetch = async (
	url: string | URL,
	options: FetchOptions = {},
) => {
	const session = await getSession();

	options.headers = {
		...options.headers,
		Authorization: `Bearer ${session?.accessToken}`,
	};

	const response = await fetch(url, options);

	if (response.status === 401) {
		// Middleware should have refreshed the access token before this render.
		// A 401 here means the session is genuinely invalid — force re-login.
		await deleteSession();
		redirect("/auth/signin");
	}

	return response;
};

