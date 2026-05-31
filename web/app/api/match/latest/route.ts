import { NextResponse } from "next/server";
import { getSessionOrNull } from "@/lib/auth/session";
import { BACKEND_URL } from "@/constants/constants";

/**
 * GET /api/match/latest
 * Fetches the latest match run for the user
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

    const response = await fetch(`${BACKEND_URL}/match/latest`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      // Match not found is ok, return null
      if (response.status === 404) {
        return NextResponse.json(null);
      }

      console.error(`Match latest fetch failed: ${response.status}`);
      return NextResponse.json(
        { error: "Failed to fetch match data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Match latest API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
