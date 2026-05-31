import { NextResponse } from "next/server";
import { getSessionOrNull } from "@/lib/auth/session";
import { BACKEND_URL } from "@/constants/constants";

/**
 * GET /api/saved-programs
 * Fetches user's saved programs from backend
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

    const response = await fetch(`${BACKEND_URL}/saved-programs`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Saved programs fetch failed: ${response.status}`);
      return NextResponse.json(
        { error: "Failed to fetch saved programs", savedPrograms: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Saved programs API error:", error);
    return NextResponse.json(
      { error: "Internal server error", savedPrograms: [] },
      { status: 500 }
    );
  }
}

/**
 * POST /api/saved-programs
 * Saves a program for the user
 */
export async function POST(request: Request) {
  try {
    const session = await getSessionOrNull();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { programId } = body;

    if (!programId) {
      return NextResponse.json(
        { error: "Missing programId" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/saved-programs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ programId }),
    });

    if (!response.ok) {
      console.error(`Save program failed: ${response.status}`);
      return NextResponse.json(
        { error: "Failed to save program" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Save program API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/saved-programs?programId=xxx
 * Removes a saved program
 */
export async function DELETE(request: Request) {
  try {
    const session = await getSessionOrNull();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId");

    if (!programId) {
      return NextResponse.json(
        { error: "Missing programId" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/saved-programs/${encodeURIComponent(programId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Unsave program failed: ${response.status}`);
      return NextResponse.json(
        { error: "Failed to unsave program" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsave program API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
