import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/constants/constants";
import { getSessionOrNull } from "@/lib/auth/session";

// 38s — slightly above the backend's own 35s ai-server timeout so the
// backend can surface its own error message before the proxy times out.
const PROXY_TIMEOUT_MS = 38_000;

export async function POST(request: NextRequest) {
	const session = await getSessionOrNull();
	if (!session?.accessToken) {
		return NextResponse.json(
			{ message: "Session expired. Please sign in again." },
			{ status: 401 },
		);
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ message: "Invalid chat payload." }, { status: 400 });
	}

	const controller = new AbortController();
	const timeoutId  = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

	try {
		const response = await fetch(`${BACKEND_URL}/chat`, {
			method:  "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${session.accessToken}`,
			},
			body:   JSON.stringify(body),
			cache:  "no-store",
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		const contentType = response.headers.get("content-type") ?? "application/json";
		const text = await response.text();

		return new NextResponse(text, {
			status:  response.status,
			headers: { "Content-Type": contentType },
		});

	} catch (error) {
		clearTimeout(timeoutId);

		if (error instanceof DOMException && error.name === "AbortError") {
			console.error("[api/chat] proxy timeout after", PROXY_TIMEOUT_MS, "ms");
			return NextResponse.json(
				{ message: "The assistant took too long to respond. Please try again." },
				{ status: 504 },
			);
		}

		console.error("[api/chat] proxy error", error);
		return NextResponse.json(
			{ message: "Could not reach the server. Check your connection and try again." },
			{ status: 502 },
		);
	}
}
