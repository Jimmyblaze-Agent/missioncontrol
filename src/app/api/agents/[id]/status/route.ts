import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  // On Vercel we can't check live agent status — return a safe offline response
  return NextResponse.json({
    id: params.id,
    status: "offline",
    lastActivity: null,
    activeSessions: 0,
  });
}
