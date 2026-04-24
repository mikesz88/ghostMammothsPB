/**
 * Phase 0 — hybrid refactor inventory: machine snapshot + team-owned prioritization.
 *
 * Writes docs/engineering/refactor-inventory.snapshot.md (overwrite).
 * See docs/engineering/refactor-inventory.md for taxonomy and how to curate priorities.
 *
 * Usage: npm run inventory:phase0
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "docs/engineering/refactor-inventory.snapshot.md");
const LINE_THRESHOLD = 200;

const TARGET_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);
const SEARCH_DIRS = ["app", "components", "hooks", "lib", "server"]
  .map((d) => path.join(ROOT, d))
  .filter((d) => fs.existsSync(d));

const SERVER_IMPORT_RE = /from\s+["']@\/server\/|from\s+["']@\/src\/server\//;
const PERSISTENCE_HINT_RE =
  /\bprisma\.|\bdb\.|\bstripe\.|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b/i;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (
      entry.name.startsWith(".") ||
      ["node_modules", ".next", "dist", "build", "coverage", "out"].includes(
        entry.name,
      )
    ) {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...walk(full));
      continue;
    }
    if (TARGET_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function lineCount(content) {
  return content.split("\n").length;
}

function isPageFile(filePath) {
  const base = path.basename(filePath);
  return base === "page.tsx" || base === "page.ts";
}

function isRouteHandler(filePath) {
  return path.basename(filePath) === "route.ts";
}

function bucketOf(rel) {
  const n = rel.replace(/\\/g, "/");
  if (n.startsWith("app/actions/")) return "action";
  if (n.startsWith("app/") && isPageFile(rel)) return "route-page";
  if (n.startsWith("app/") && n.endsWith("/route.ts")) return "api-route";
  if (n.startsWith("app/")) return "app-local";
  if (n.startsWith("components/")) return "component";
  if (n.startsWith("hooks/")) return "hook";
  if (n.startsWith("lib/")) return "lib";
  if (n.startsWith("server/")) return "server";
  return "other";
}

function autoFlags(rel, content, lines, buck) {
  const flags = [];
  if (lines >= 300) flags.push("very large (300+)");
  else if (lines >= LINE_THRESHOLD) flags.push(`large (${LINE_THRESHOLD}+)`);

  const useClient =
    content.includes('"use client"') || content.includes("'use client'");
  if (buck === "route-page" && useClient) flags.push('"use client" page');

  const norm = rel.replace(/\\/g, "/");
  if (
    norm.startsWith("components/") &&
    PERSISTENCE_HINT_RE.test(content)
  ) {
    flags.push("persistence-like patterns in component");
  }
  if (
    (norm.startsWith("components/") || norm.startsWith("hooks/")) &&
    SERVER_IMPORT_RE.test(content)
  ) {
    flags.push("server import in client-ish file");
  }

  return flags.length ? flags.join("; ") : "—";
}

function includeRow(lines, buck, content) {
  if (lines >= LINE_THRESHOLD) return true;
  if (buck !== "route-page") return false;
  return (
    content.includes('"use client"') || content.includes("'use client'")
  );
}

function escCell(s) {
  return String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function main() {
  const rows = [];
  for (const dir of SEARCH_DIRS) {
    for (const filePath of walk(dir)) {
      const content = fs.readFileSync(filePath, "utf8");
      const lines = lineCount(content);
      const rel = path.relative(ROOT, filePath);
      const buck = bucketOf(rel);
      if (!includeRow(lines, buck, content)) continue;

      rows.push({
        path: rel.split(path.sep).join("/"),
        lines,
        bucket: buck,
        flags: autoFlags(rel, content, lines, buck),
      });
    }
  }

  rows.sort((a, b) => b.lines - a.lines || a.path.localeCompare(b.path));

  const iso = new Date().toISOString();
  const table = [
    "| Path | Lines | Bucket | Auto flags | Primary tag (team) | Priority (team) | Target phase (team) | Notes (team) |",
    "| --- | ---: | --- | --- | --- | --- | --- | --- |",
    ...rows.map((r) => {
      const cells = [
        escCell(r.path),
        String(r.lines),
        r.bucket,
        escCell(r.flags),
        "",
        "",
        "",
        "",
      ];
      return `| ${cells.join(" | ")} |`;
    }),
  ].join("\n");

  const body = `# Refactor inventory — automated snapshot

Generated: \`${iso}\` (run \`npm run inventory:phase0\` to refresh).

Rows include files with **≥${LINE_THRESHOLD} lines** or **route \`page.tsx\`/\`page.ts\` with \`"use client"\`** (any size).

**Team-owned columns** are left empty here. Copy rows into \`refactor-inventory.md\` and fill **Primary tag**, **Priority**, **Target phase**, and **Notes** — or edit in place and merge carefully on regenerate.

### Tag options (from phased plan)

- server-page migration  
- client-island extraction  
- form extraction  
- action split  
- service split  
- shared UI split  

---

${table}

---

*${rows.length} row(s).*
`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, body, "utf8");
  console.log(`Wrote ${path.relative(ROOT, OUT)} (${rows.length} rows).`);
}

main();
