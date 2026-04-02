import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// On Vercel we can't run shell commands or read Mac Mini system stats.
// Return a static placeholder so the UI doesn't crash.
export async function GET() {
  return NextResponse.json({
    cpu: 0,
    ram: { used: 0, total: 0, percent: 0 },
    disk: { used: 0, total: 0, percent: 0 },
    uptime: 0,
    platform: "vercel",
    note: "Live system stats unavailable on Vercel — run Mission Control locally for real stats.",
  });
}
