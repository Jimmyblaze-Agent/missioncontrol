import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").toLowerCase().trim();

  try {
    // Search through committed research.json
    const researchPath = path.join(process.cwd(), "data", "research.json");
    const research = JSON.parse(readFileSync(researchPath, "utf-8"));
    const items = Array.isArray(research) ? research : [research];

    if (!query) {
      return NextResponse.json({ results: items.slice(0, 20), total: items.length });
    }

    const results = items.filter((item: Record<string, unknown>) => {
      const text = JSON.stringify(item).toLowerCase();
      return text.includes(query);
    });

    return NextResponse.json({ results: results.slice(0, 20), total: results.length });
  } catch {
    return NextResponse.json({ results: [], total: 0 });
  }
}
