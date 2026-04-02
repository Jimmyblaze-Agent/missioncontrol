import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    cpu: 0, ram: 0, disk: 0, uptime: 0,
    note: "Live monitoring unavailable on Vercel.",
  });
}
