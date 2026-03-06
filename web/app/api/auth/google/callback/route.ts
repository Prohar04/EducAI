import { createSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { BACKEND_URL } from "@/constants/constants";

const ACCESS_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || "",
);

export async function GET(req: NextRequest) {
	// Tokens are now set as httpOnly cookies by the backend
	const accessToken = req.cookies.get("accessToken")?.value;
	const refreshToken = req.cookies.get("refreshToken")?.value;

	if (!accessToken || !refreshToken) {
		redirect("/auth/signin?error=oauth_failed");
	}

	// Extract user info from the verified JWT instead of trusting query params
	let userId: string;
	try {
		const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
		userId = payload.userId as string;
		if (!userId) throw new Error("Missing userId in token");
	} catch {
		redirect("/auth/signin?error=invalid_token");
	}

	// Fetch user profile from backend using the access token
	const profileRes = await fetch(`${BACKEND_URL}/auth/me`, {
		headers: { Authorization: `Bearer ${accessToken}` },
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
