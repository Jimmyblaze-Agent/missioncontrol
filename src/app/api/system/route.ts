import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Vercel deployment: return static GreenOx agent identity
// Live system info requires running Mission Control locally on the Mac Mini
export async function GET() {
  return NextResponse.json({
    identity: {
      name: "JimmyBlaze",
      creature: "Executive AI",
      emoji: "🦾",
    },
    workspace: "/Users/jimmyblaze/.openclaw/workspace",
    integrations: [
      { name: "AgentMail", status: "connected", icon: "📧" },
      { name: "Vercel", status: "connected", icon: "▲" },
      { name: "GitHub", status: "connected", icon: "🐙" },
      { name: "Beehiiv", status: "connected", icon: "🐝" },
      { name: "OpenRouter", status: "connected", icon: "🔀" },
      { name: "Pinterest", status: "pending", icon: "📌" },
    ],
    note: "Live system details unavailable on Vercel.",
  });
}
