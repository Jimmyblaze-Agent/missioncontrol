#!/usr/bin/env node
/**
 * export-data.js — GreenOx Mission Control data exporter
 * Reads TASKS.md files and agent configs, outputs JSON to data/
 * Run: node scripts/export-data.js
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const HOME = os.homedir();
const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(HOME, ".openclaw");
const WORKSPACE = process.env.OPENCLAW_WORKSPACE || path.join(OPENCLAW_DIR, "workspace");
const DATA_DIR = path.join(__dirname, "..", "data");

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ─── Parse TASKS.md (workspace format) ───────────────────────────────────────
function parseWorkspaceTasks(content) {
  const tasks = [];
  const taskRegex = /###\s+(TASK-\d+)\s+—\s+(.+?)\n([\s\S]*?)(?=###\s+TASK-|\n---\n## |$)/g;
  let match;
  while ((match = taskRegex.exec(content)) !== null) {
    const id = match[1];
    const title = match[2].trim();
    const body = match[3];

    const ownerMatch = body.match(/\*\*Owner:\*\*\s*(.+)/);
    const statusMatch = body.match(/\*\*Status:\*\*\s*(.+)/);
    const openedMatch = body.match(/\*\*Opened:\*\*\s*(.+)/);
    const closedMatch = body.match(/\*\*Closed:\*\*\s*(.+)/);
    const notesMatch = body.match(/\*\*Notes:\*\*\s*([\s\S]*?)(?=\n\*\*|\n---|\n###|$)/);
    const outcomeMatch = body.match(/\*\*Outcome:\*\*\s*([\s\S]*?)(?=\n\*\*|\n---|\n###|$)/);
    const urlMatch = body.match(/\*\*Live URL:\*\*\s*(.+)/);

    const statusRaw = statusMatch ? statusMatch[1].trim() : "";
    let status = "open";
    if (statusRaw.includes("✅") || statusRaw.toLowerCase().includes("complete")) status = "done";
    else if (statusRaw.includes("🔵") || statusRaw.toLowerCase().includes("in progress")) status = "in_progress";
    else if (statusRaw.includes("🔴") || statusRaw.toLowerCase().includes("blocked")) status = "blocked";
    else if (statusRaw.includes("⏸️") || statusRaw.toLowerCase().includes("on hold")) status = "on_hold";

    tasks.push({
      id,
      title,
      owner: ownerMatch ? ownerMatch[1].replace(/\(.*?\)/g, "").trim() : "Unknown",
      status,
      opened: openedMatch ? openedMatch[1].trim() : null,
      closed: closedMatch ? closedMatch[1].trim() : null,
      notes: notesMatch ? notesMatch[1].trim() : null,
      outcome: outcomeMatch ? outcomeMatch[1].trim() : null,
      liveUrl: urlMatch ? urlMatch[1].trim() : null,
      source: "workspace",
    });
  }
  return tasks;
}

// ─── Parse Lex TASKS.md (schema format) ──────────────────────────────────────
function parseLexTasks(content) {
  const tasks = [];
  const taskRegex = /###[^`\n]*\n```\n([\s\S]*?)```/g;
  let match;
  while ((match = taskRegex.exec(content)) !== null) {
    const block = match[1];
    const get = (key) => {
      const m = block.match(new RegExp(`${key}:\\s*(.+)`));
      return m ? m[1].trim() : null;
    };
    const id = get("id");
    if (!id) continue;
    const statusRaw = get("status") || "";
    let status = "open";
    if (statusRaw === "DONE") status = "done";
    else if (statusRaw === "IN_PROGRESS") status = "in_progress";
    else if (statusRaw === "BLOCKED") status = "blocked";

    const descMatch = block.match(/description:\s*([\s\S]*?)(?=outcome:|tags:|$)/);
    const outcomeMatch = block.match(/outcome:\s*([\s\S]*?)(?=\n[a-z]+:|$)/);

    tasks.push({
      id,
      title: get("title"),
      owner: get("owner") || "Lex",
      status,
      opened: get("created_at"),
      closed: get("updated_at"),
      tags: (get("tags") || "").replace(/[\[\]]/g, "").split(",").map((t) => t.trim()).filter(Boolean),
      notes: descMatch ? descMatch[1].trim() : null,
      outcome: outcomeMatch ? outcomeMatch[1].trim() : null,
      liveUrl: null,
      source: "lex",
    });
  }
  return tasks;
}

// ─── Agent definitions ────────────────────────────────────────────────────────
const AGENTS = [
  { id: "main", name: "JimmyBlaze", emoji: "🦾", role: "COO / Chief of Staff", model: "claude-sonnet-4.6", color: "#FFCC00" },
  { id: "Lex", name: "Lex", emoji: "⚙️", role: "CTO", model: "xiaomi/mimo-v2-flash", color: "#4CAF50" },
  { id: "Sally", name: "Sally", emoji: "🎨", role: "CMO", model: "google/gemini-2.0-flash-lite", color: "#E91E63" },
  { id: "Hunter", name: "Hunter", emoji: "🔍", role: "Lead Researcher", model: "qwen/qwen3-235b-a22b:free", color: "#0077B5" },
  { id: "Ernest", name: "Ernest", emoji: "✍️", role: "Lead Copywriter", model: "meta-llama/llama-4-maverick:free", color: "#9C27B0" },
];

// ─── Main export ──────────────────────────────────────────────────────────────
console.log("📦 Exporting GreenOx Mission Control data...\n");

// Tasks
let allTasks = [];
const workspaceTasksPath = path.join(WORKSPACE, "TASKS.md");
if (fs.existsSync(workspaceTasksPath)) {
  const content = fs.readFileSync(workspaceTasksPath, "utf-8");
  const parsed = parseWorkspaceTasks(content);
  allTasks.push(...parsed);
  console.log(`✅ Workspace TASKS.md: ${parsed.length} tasks`);
} else {
  console.log(`⚠️  Workspace TASKS.md not found at ${workspaceTasksPath}`);
}

const lexTasksPath = path.join(OPENCLAW_DIR, "agents/Lex/memory/TASKS.md");
if (fs.existsSync(lexTasksPath)) {
  const content = fs.readFileSync(lexTasksPath, "utf-8");
  const parsed = parseLexTasks(content);
  // Merge: don't duplicate IDs already in workspace tasks
  const existingIds = new Set(allTasks.map((t) => t.id));
  const newTasks = parsed.filter((t) => !existingIds.has(t.id));
  allTasks.push(...newTasks);
  console.log(`✅ Lex TASKS.md: ${parsed.length} tasks (${newTasks.length} new)`);
} else {
  console.log(`⚠️  Lex TASKS.md not found at ${lexTasksPath}`);
}

fs.writeFileSync(path.join(DATA_DIR, "tasks.json"), JSON.stringify(allTasks, null, 2));
console.log(`\n📝 Exported ${allTasks.length} total tasks → data/tasks.json`);

// Projects (derived from task groupings)
const projectMap = {};
allTasks.forEach((task) => {
  // Extract project from tags or title
  const tags = task.tags || [];
  const projectTag = tags.find((t) => ["rvnewsletter", "newsletter", "pinterest", "missioncontrol", "knowledge-vault", "social", "agentmail"].includes(t));
  const project = projectTag || "general";
  if (!projectMap[project]) projectMap[project] = { id: project, name: project.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), tasks: [] };
  projectMap[project].tasks.push(task.id);
});
const projects = Object.values(projectMap);
fs.writeFileSync(path.join(DATA_DIR, "projects.json"), JSON.stringify(projects, null, 2));
console.log(`📁 Exported ${projects.length} projects → data/projects.json`);

// Agents
const agentsWithTaskCounts = AGENTS.map((agent) => {
  const agentTasks = allTasks.filter((t) => t.owner && t.owner.toLowerCase().includes(agent.name.toLowerCase()));
  return {
    ...agent,
    taskCounts: {
      total: agentTasks.length,
      open: agentTasks.filter((t) => t.status === "open").length,
      in_progress: agentTasks.filter((t) => t.status === "in_progress").length,
      blocked: agentTasks.filter((t) => t.status === "blocked").length,
      done: agentTasks.filter((t) => t.status === "done").length,
    },
  };
});
fs.writeFileSync(path.join(DATA_DIR, "agents.json"), JSON.stringify(agentsWithTaskCounts, null, 2));
console.log(`🤖 Exported ${agentsWithTaskCounts.length} agents → data/agents.json`);

// Research (Knowledge Vault)
const researchPath = path.join(OPENCLAW_DIR, "agents/Lex/research/research.json");
if (fs.existsSync(researchPath)) {
  const research = JSON.parse(fs.readFileSync(researchPath, "utf-8"));
  fs.writeFileSync(path.join(DATA_DIR, "research.json"), JSON.stringify(research, null, 2));
  console.log(`🔬 Exported ${Array.isArray(research) ? research.length : 1} research items → data/research.json`);
} else {
  fs.writeFileSync(path.join(DATA_DIR, "research.json"), JSON.stringify([], null, 2));
  console.log(`⚠️  No research.json found — wrote empty array`);
}

console.log("\n✅ Export complete.");
