import { createSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { BACKEND_URL } from "@/constants/constants";

const ACCESS_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || "",
);

export async function GET(req: NextRequest) {
	// Backend passes a short-lived one-time code to avoid cross-origin cookie issues.
	// Exchange it server-to-server for the actual tokens.
	const code = req.nextUrl.searchParams.get("code");
	if (!code) {
		redirect("/auth/signin?error=oauth_failed");
	}

	const exchangeRes = await fetch(`${BACKEND_URL}/auth/google/exchange?code=${code}`, {
		cache: "no-store",
	});

	if (!exchangeRes.ok) {
		redirect("/auth/signin?error=oauth_failed");
	}

	const { accessToken, refreshToken } = await exchangeRes.json() as {
		accessToken: string;
		refreshToken: string;
	};

	// Verify the access token so we can extract userId without trusting external input
	let userId: string;
	try {
		const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
		userId = payload.userId as string;
		if (!userId) throw new Error("Missing userId in token");
	} catch {
		redirect("/auth/signin?error=invalid_token");
	}

	// Fetch full profile from backend using the verified access token
	const profileRes = await fetch(`${BACKEND_URL}/auth/me`, {
		headers: { Authorization: `Bearer ${accessToken}` },
		cache: "no-store",
	});

	if (!profileRes.ok) {
		redirect("/auth/signin?error=profile_fetch_failed");
	}

	const user = await profileRes.json();

	await createSession({
		user: {
			id: userId,
			name: user.name,
			email: user.email,
			avatarUrl: user.avatarUrl || undefined,
			emailVerified: user.emailVerified ?? true,
			isActive: user.isActive ?? true,
		},
		accessToken,
		refreshToken,
	});

	redirect("/");
}
