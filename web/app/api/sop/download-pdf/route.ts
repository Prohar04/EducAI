import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/constants/constants";
import { getSessionOrNull } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const session = await getSessionOrNull();
  if (!session?.accessToken) {
    return NextResponse.json({ message: "Unauthorised" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const upstream = await fetch(`${BACKEND_URL}/sop/download-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const blob = await upstream.arrayBuffer();
    return new NextResponse(blob, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/pdf",
        "Content-Disposition": upstream.headers.get("Content-Disposition") ?? 'attachment; filename="SOP.pdf"',
      },
    });
  } catch (err) {
    clearTimeout(timeout);
    console.error("[api/sop/download-pdf]", err);
    return NextResponse.json({ message: "PDF generation failed" }, { status: 502 });
  }
}
