"use client";

import { useEffect, useState } from "react";
import { RefreshCw, GripVertical, AlertTriangle, CheckCircle, Clock, Inbox, X } from "lucide-react";

interface Task {
  id: string;
  title: string;
  owner: string;
  status: string;
  opened: string;
  closed: string | null;
  notes: string | null;
  outcome: string | null;
  liveUrl: string | null;
  source: string;
}

const COLUMNS = [
  { key: "backlog", label: "Backlog", color: "#525252", icon: Inbox },
  { key: "in_progress", label: "In Progress", color: "#0A84FF", icon: Clock },
  { key: "ceo_action", label: "CEO Action", color: "#FFD60A", icon: AlertTriangle },
  { key: "qa", label: "QA", color: "#BF5AF2", icon: CheckCircle },
  { key: "complete", label: "Complete", color: "#32D74B", icon: CheckCircle },
];

function mapStatus(status: string): string {
  switch (status) {
    case "open": return "backlog";
    case "in_progress": return "in_progress";
    case "blocked": return "ceo_action";
    case "on_hold": return "ceo_action";
    case "done": return "complete";
    default: return "backlog";
  }
}

function getOwnerEmoji(owner: string): string {
  const lower = owner.toLowerCase();
  if (lower.includes("jimmy")) return "🦾";
  if (lower.includes("lex")) return "⚙️";
  if (lower.includes("sally")) return "🎨";
  if (lower.includes("hunter")) return "🔍";
  if (lower.includes("ernest")) return "✍️";
  if (lower.includes("jeremy")) return "👤";
  return "📋";
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks || data || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const getColumnTasks = (columnKey: string) => {
    return tasks.filter((t) => mapStatus(t.status) === columnKey);
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: "#2E7D32" }} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold mb-1"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-1px" }}
          >
            📋 Tasks
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            {tasks.length} tasks across the org — drag to reorder (coming soon)
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchTasks(); }}
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 1rem", backgroundColor: "#2E7D32", color: "#fff",
            borderRadius: "0.5rem", border: "none", cursor: "pointer", fontWeight: 600,
          }}
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Kanban Board */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flex: 1,
          overflowX: "auto",
          paddingBottom: "1rem",
        }}
      >
        {COLUMNS.map((col) => {
          const colTasks = getColumnTasks(col.key);
          const isCeoAction = col.key === "ceo_action";
          const ColIcon = col.icon;

          return (
            <div
              key={col.key}
              style={{
                minWidth: "260px",
                width: "260px",
                flex: "0 0 260px",
                display: "flex",
                flexDirection: "column",
                borderRadius: "0.75rem",
                backgroundColor: isCeoAction ? "rgba(255, 214, 10, 0.06)" : "var(--surface)",
                border: isCeoAction ? "1px solid rgba(255, 214, 10, 0.25)" : "1px solid var(--border)",
                overflow: "hidden",
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: `2px solid ${col.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: isCeoAction ? "rgba(255, 214, 10, 0.08)" : undefined,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <ColIcon style={{ width: "16px", height: "16px", color: col.color }} />
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      color: isCeoAction ? "#FFD60A" : "var(--text-primary)",
                    }}
                  >
                    {col.label}
                  </span>
                </div>
                <span
                  style={{
                    backgroundColor: `${col.color}25`,
                    color: col.color,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.125rem 0.5rem",
                    borderRadius: "9999px",
                  }}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ flex: 1, padding: "0.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {colTasks.length === 0 && (
                  <div style={{ padding: "1.5rem 0.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    No tasks
                  </div>
                )}
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      cursor: "pointer",
                      transition: "all 150ms ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = col.color;
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Task ID */}
                    <div style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                      {task.id}
                    </div>
                    {/* Title */}
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: "0.5rem",
                        lineHeight: 1.3,
                      }}
                    >
                      {task.title}
                    </div>
                    {/* Owner */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      <span>{getOwnerEmoji(task.owner)}</span>
                      <span>{task.owner}</span>
                    </div>
                    {/* Status badge */}
                    <div style={{ marginTop: "0.5rem" }}>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          padding: "0.125rem 0.4rem",
                          borderRadius: "0.25rem",
                          backgroundColor: `${col.color}20`,
                          color: col.color,
                        }}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "2rem",
          }}
          onClick={() => setSelectedTask(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "540px", width: "100%",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{selectedTask.id}</span>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>{selectedTask.title}</h2>
              </div>
              <button onClick={() => setSelectedTask(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div><strong style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Owner:</strong> <span style={{ color: "var(--text-primary)" }}>{getOwnerEmoji(selectedTask.owner)} {selectedTask.owner}</span></div>
              <div><strong style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Status:</strong> <span style={{ color: "var(--text-primary)" }}>{selectedTask.status}</span></div>
              <div><strong style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Opened:</strong> <span style={{ color: "var(--text-primary)" }}>{selectedTask.opened}</span></div>
              {selectedTask.closed && <div><strong style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Closed:</strong> <span style={{ color: "var(--text-primary)" }}>{selectedTask.closed}</span></div>}
              {selectedTask.notes && (
                <div>
                  <strong style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Notes:</strong>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem", lineHeight: 1.5 }}>{selectedTask.notes}</p>
                </div>
              )}
              {selectedTask.outcome && (
                <div>
                  <strong style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Outcome:</strong>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem", lineHeight: 1.5 }}>{selectedTask.outcome}</p>
                </div>
              )}
              {selectedTask.liveUrl && (
                <div>
                  <strong style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Live URL:</strong>{" "}
                  <a href={selectedTask.liveUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#2E7D32" }}>{selectedTask.liveUrl}</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
