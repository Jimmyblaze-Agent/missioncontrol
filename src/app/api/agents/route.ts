import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const FALLBACK_AGENTS = [
  { id: "main", name: "JimmyBlaze", emoji: "🦾", role: "COO / Chief of Staff", model: "claude-sonnet-4.6", color: "#FFCC00", status: "online", activeSessions: 0, taskCounts: { total: 0, open: 0, in_progress: 0, blocked: 0, done: 0 } },
  { id: "Lex", name: "Lex", emoji: "⚙️", role: "CTO", model: "xiaomi/mimo-v2-flash", color: "#4CAF50", status: "offline", activeSessions: 0, taskCounts: { total: 0, open: 0, in_progress: 0, blocked: 0, done: 0 } },
  { id: "Sally", name: "Sally", emoji: "🎨", role: "CMO", model: "google/gemini-2.0-flash-lite", color: "#E91E63", status: "offline", activeSessions: 0, taskCounts: { total: 0, open: 0, in_progress: 0, blocked: 0, done: 0 } },
  { id: "Hunter", name: "Hunter", emoji: "🔍", role: "Lead Researcher", model: "qwen/qwen3-235b-a22b:free", color: "#0077B5", status: "offline", activeSessions: 0, taskCounts: { total: 0, open: 0, in_progress: 0, blocked: 0, done: 0 } },
  { id: "Ernest", name: "Ernest", emoji: "✍️", role: "Lead Copywriter", model: "meta-llama/llama-4-maverick:free", color: "#9C27B0", status: "offline", activeSessions: 0, taskCounts: { total: 0, open: 0, in_progress: 0, blocked: 0, done: 0 } },
];

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "agents.json");
    const agents = JSON.parse(readFileSync(filePath, "utf-8"));
    return NextResponse.json({ agents });
  } catch {
    return NextResponse.json({ agents: FALLBACK_AGENTS });
  }
}
