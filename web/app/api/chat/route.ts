import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/constants/constants";
import { getSessionOrNull } from "@/lib/auth/session";

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

	try {
		const response = await fetch(`${BACKEND_URL}/chat`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session.accessToken}`,
			},
			body: JSON.stringify(body),
			cache: "no-store",
		});

		const contentType = response.headers.get("content-type") || "application/json";
		const text = await response.text();

		return new NextResponse(text, {
			status: response.status,
			headers: { "Content-Type": contentType },
		});
	} catch (error) {
		console.error("[api/chat]", error);
		return NextResponse.json(
			{ message: "The assistant is temporarily unavailable. Please try again shortly." },
			{ status: 502 },
		);
	}
}
