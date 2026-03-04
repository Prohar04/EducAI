import { BACKEND_URL } from "@/constants/constants";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const { origin } = new URL(req.url);
	const callbackUrl = `${origin}/api/auth/google/callback`;

	// Redirect the browser to the backend's Google OAuth initiation endpoint
	// with a redirect_uri pointing back to our Next.js callback handler.
	const backendUrl = new URL(`${BACKEND_URL}/auth/google/login`);
	backendUrl.searchParams.set("redirect_uri", callbackUrl);

	return NextResponse.redirect(backendUrl.toString());
}
