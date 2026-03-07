import { createSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { BACKEND_URL } from "@/constants/constants";

export async function GET(req: NextRequest) {
	// Backend passes a short-lived one-time code to avoid cross-origin cookie issues.
	// Exchange it server-to-server for the actual tokens + user profile.
	const code = req.nextUrl.searchParams.get("code");
	if (!code) {
		redirect("/auth/signin?error=oauth_failed");
	}

	const exchangeRes = await fetch(
		`${BACKEND_URL}/auth/google/exchange?code=${code}`,
		{ cache: "no-store" },
	);

	if (!exchangeRes.ok) {
		redirect("/auth/signin?error=oauth_failed");
	}

	const { accessToken, refreshToken, user } = await exchangeRes.json() as {
		accessToken: string;
		refreshToken: string;
		user: {
			id: string;
			email: string;
			name: string;
			avatarUrl: string | null;
			emailVerified: boolean;
			isActive: boolean;
		};
	};

	if (!user?.id) {
		redirect("/auth/signin?error=invalid_token");
	}

	await createSession({
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			avatarUrl: user.avatarUrl ?? undefined,
			emailVerified: user.emailVerified,
			isActive: user.isActive,
		},
		accessToken,
		refreshToken,
	});

	redirect("/app");
}
