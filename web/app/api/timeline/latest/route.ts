import { NextResponse } from "next/server";
import { getSessionOrNull } from "@/lib/auth/session";
import { BACKEND_URL } from "@/constants/constants";

/**
 * GET /api/timeline/latest
 * Fetches the latest timeline for the user
 */
export async function GET() {
  try {
    const session = await getSessionOrNull();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/timeline/latest`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      // Timeline not found is ok, return null
      if (response.status === 404) {
        return NextResponse.json(null);
      }

      console.error(`Timeline latest fetch failed: ${response.status}`);
      return NextResponse.json(
        { error: "Failed to fetch timeline data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Timeline latest API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
