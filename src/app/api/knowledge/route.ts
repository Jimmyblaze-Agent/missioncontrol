import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cardsPath = path.join(process.cwd(), "data", "research-cards.json");
    const cards = JSON.parse(readFileSync(cardsPath, "utf-8"));
    return NextResponse.json({ cards });
  } catch {
    try {
      const researchPath = path.join(process.cwd(), "data", "research.json");
      const research = JSON.parse(readFileSync(researchPath, "utf-8"));
      const items = Array.isArray(research) ? research : [research];
      const cards = items.map((item: Record<string, unknown>) => ({
        id: item.id || String(Math.random()),
        title: (item.subject as string) || (item.title as string) || "Untitled",
        summary: String(item.content || item.body || item.text || "").slice(0, 200),
        url: (item.url as string) || "",
        category: "Research",
      }));
      return NextResponse.json({ cards });
    } catch {
      return NextResponse.json({ cards: [] });
    }
  }
}
