import { createSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { BACKEND_URL } from "@/constants/constants";

// Guard: server mounts OAuth at /auth, not /api/v1/auth
if (BACKEND_URL.includes("/api/v1")) {
	console.warn(
		`[oauth] BACKEND_URL "${BACKEND_URL}" contains "/api/v1" — OAuth routes are at /auth, not /api/v1/auth. Update BACKEND_URL to omit the path prefix.`,
	);
}

export async function GET(req: NextRequest) {
	// Backend passes a short-lived one-time code to avoid cross-origin cookie issues.
	// Exchange it server-to-server for the actual tokens + user profile.
	const code = req.nextUrl.searchParams.get("code");
	if (!code) {
		redirect("/auth/signin?error=oauth_failed");
	}

	let exchangeRes: Response;
	try {
		exchangeRes = await fetch(
			`${BACKEND_URL}/auth/google/exchange?code=${code}`,
			{ cache: "no-store" },
		);
	} catch {
		redirect("/auth/signin?error=oauth_server");
	}

	if (exchangeRes.status === 401) {
		redirect("/auth/signin?error=oauth_expired");
	}

	if (!exchangeRes.ok) {
		redirect("/auth/signin?error=oauth_server");
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
		rememberMe: false,
	});

	redirect("/onboarding-check");
}
