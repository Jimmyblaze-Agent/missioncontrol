"use client";
import { useEffect, useState } from "react";
import { ExternalLink, Tag, BookOpen } from "lucide-react";

interface KnowledgeCard {
  id: string;
  title: string;
  summary: string;
  url: string;
  category: string;
  lastUsed?: string;
}

export default function KnowledgePage() {
  const [cards, setCards] = useState<KnowledgeCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/knowledge")
      .then(r => r.json())
      .then(d => { setCards(d.cards || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse" style={{ color: "var(--text-muted)" }}>Loading knowledge base...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex items-start gap-3">
        <BookOpen className="w-7 h-7 mt-0.5" style={{ color: "#2E7D32" }} />
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-1px" }}>
            JG Knowledge
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Jeremy's personal research vault — articles saved via email and Reddit
          </p>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-20 rounded-xl" style={{ border: "1px dashed var(--border)", color: "var(--text-muted)" }}>
          <BookOpen className="w-10 h-10 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No knowledge items yet.</p>
          <p className="text-sm mt-2 max-w-sm mx-auto">
            Send emails to jimmyblaze@agentmail.to with subject: <strong>SAVE</strong> to add items.
            Reddit saved posts will populate here once credentials are configured.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(card => (
            <div
              key={card.id}
              className="rounded-xl p-5 flex flex-col gap-3 transition-shadow hover:shadow-lg"
              style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: "var(--card-elevated)", color: "var(--text-muted)" }}
                >
                  <Tag className="w-3 h-3" />
                  {card.category}
                </span>
                {card.lastUsed && (
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ backgroundColor: "#2E7D32", color: "white" }}
                  >
                    RAG Active
                  </span>
                )}
              </div>

              <h3 className="font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
                {card.title}
              </h3>

              <p className="text-sm flex-1" style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
                {card.summary}
              </p>

              {card.url && (
                <a
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium mt-auto"
                  style={{ color: "#2E7D32" }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Read source
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
