import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// On Vercel we can't run openclaw CLI — return committed cron data or empty
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "tasks.json");
    const tasks = JSON.parse(readFileSync(filePath, "utf-8"));
    // Derive cron-like entries from tasks that mention cron/scheduled
    const cronJobs = tasks
      .filter((t: Record<string, unknown>) => {
        const text = JSON.stringify(t).toLowerCase();
        return text.includes("cron") || text.includes("every 6 hour") || text.includes("heartbeat") || text.includes("daily");
      })
      .map((t: Record<string, unknown>) => ({
        id: t.id,
        name: t.title,
        agentId: "main",
        enabled: true,
        scheduleDisplay: "Scheduled",
        timezone: "America/Chicago",
        nextRun: null,
        lastRun: null,
        description: t.notes || "",
      }));
    return NextResponse.json(cronJobs);
  } catch {
    return NextResponse.json([]);
  }
}

export async function PUT() {
  return NextResponse.json({ error: "Cron management unavailable on Vercel." }, { status: 503 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Cron management unavailable on Vercel." }, { status: 503 });
}
