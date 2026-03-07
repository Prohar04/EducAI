import { refreshToken } from "./auth";
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
	let response = await fetch(url, options);

	if (response.status === 401) {
		if (!session?.refreshToken) {
			await deleteSession();
			redirect("/auth/signin");
		}

		const newAccessToken = await refreshToken(session.refreshToken);

		if (newAccessToken) {
			options.headers.Authorization = `Bearer ${newAccessToken}`;
			response = await fetch(url, options);
		} else {
			// Both access and refresh tokens are invalid – clear session and force re-login
			await deleteSession();
			redirect("/auth/signin");
		}
	}
	return response;
};
