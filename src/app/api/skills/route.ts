import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Return configured skills from committed data file, or a GreenOx hardcoded list
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "configured-skills.example.json");
    const skills = JSON.parse(readFileSync(filePath, "utf-8"));
    return NextResponse.json({ skills });
  } catch {
    return NextResponse.json({
      skills: [
        { id: "weather", name: "Weather", description: "Current weather and forecasts via wttr.in", emoji: "🌤️", source: "system" },
        { id: "github", name: "GitHub", description: "GitHub operations via gh CLI", emoji: "🐙", source: "system" },
        { id: "gh-issues", name: "GH Issues", description: "Fetch and fix GitHub issues, open PRs", emoji: "🔧", source: "system" },
        { id: "healthcheck", name: "Health Check", description: "Security hardening and risk audit", emoji: "🛡️", source: "system" },
        { id: "clawflow", name: "ClawFlow", description: "Detached task orchestration runtime", emoji: "🌊", source: "system" },
      ],
    });
  }
}
