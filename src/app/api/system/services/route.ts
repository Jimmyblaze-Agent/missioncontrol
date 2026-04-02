import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Service management requires local Mac Mini access — not available on Vercel
export async function GET() {
  return NextResponse.json({ services: [], note: "Service management unavailable on Vercel." });
}

export async function POST() {
  return NextResponse.json({ error: "Service management unavailable on Vercel." }, { status: 503 });
}
