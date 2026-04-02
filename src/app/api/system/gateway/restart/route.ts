import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await execAsync("openclaw gateway restart", { timeout: 30000 });
    return NextResponse.json({ success: true, message: "Gateway restarted successfully" });
  } catch {
    try {
      await execAsync("sudo systemctl restart openclaw", { timeout: 30000 });
      return NextResponse.json({ success: true, message: "Gateway restarted successfully" });
    } catch (err2) {
      return NextResponse.json({ success: false, message: String(err2) }, { status: 500 });
    }
  }
}
