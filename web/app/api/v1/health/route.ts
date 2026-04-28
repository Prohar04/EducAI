import { NextResponse } from "next/server";

const START_TIME = Date.now();

export async function GET() {
	return NextResponse.json(
		{
			status: "ok",
			service: "educai-web",
			version: "0.1.0",
			environment: process.env.NODE_ENV ?? "production",
			uptime: Math.floor((Date.now() - START_TIME) / 1000),
			timestamp: new Date().toISOString(),
		},
		{ status: 200 },
	);
}

export async function HEAD() {
	return new Response(null, { status: 200 });
}
