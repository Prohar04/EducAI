import { NextResponse } from "next/server";
import { fetchEducationPulse } from "@/lib/data/fetchEducationPulse";

export async function GET() {
  try {
    const items = await fetchEducationPulse();
    return NextResponse.json({ news: items, lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error("[education-pulse]", error);
    return NextResponse.json({ news: [], lastUpdated: new Date().toISOString() });
  }
}
