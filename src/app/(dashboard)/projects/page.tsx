"use client";
import { useEffect, useState } from "react";
import { FolderKanban, AlertCircle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  owner: string;
}

interface Project {
  id: string;
  name: string;
  tasks: string[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then(r => r.json()),
      fetch("/api/tasks").then(r => r.json()),
    ]).then(([pd, td]) => {
      setProjects(pd.projects || []);
      setTasks(td.tasks || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getProjectTasks = (taskIds: string[]) =>
    tasks.filter(t => taskIds.includes(t.id));

  const hasBlocker = (taskIds: string[]) =>
    tasks.some(t => taskIds.includes(t.id) && (t.status === "blocked" || t.status === "on_hold"));

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse" style={{ color: "var(--text-muted)" }}>Loading projects...</div>
    </div>
  );

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex items-start gap-3">
        <FolderKanban className="w-7 h-7 mt-0.5" style={{ color: "#2E7D32" }} />
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-1px" }}>Projects</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Strategic objectives and their task status</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 rounded-xl" style={{ border: "1px dashed var(--border)", color: "var(--text-muted)" }}>
          <FolderKanban className="w-10 h-10 mx-auto mb-4 opacity-30" />
          <p>No projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => {
            const projectTasks = getProjectTasks(project.tasks || []);
            const blocked = hasBlocker(project.tasks || []);
            const done = projectTasks.filter(t => t.status === "done").length;
            const total = projectTasks.length;

            return (
              <div
                key={project.id}
                className="rounded-xl p-5"
                style={{
                  backgroundColor: "var(--card)",
                  border: `1px solid ${blocked ? "#dc2626" : "var(--border)"}`,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold capitalize" style={{ color: "var(--text-primary)" }}>
                    {project.name}
                  </h3>
                  {blocked && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#dc2626", color: "white" }}>
                      <AlertCircle className="w-3 h-3" /> Blocked
                    </span>
                  )}
                </div>
                <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
                  {done}/{total} tasks complete
                </p>
                {total > 0 && (
                  <div className="w-full rounded-full h-1.5" style={{ backgroundColor: "var(--card-elevated)" }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${(done / total) * 100}%`, backgroundColor: "#2E7D32" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
