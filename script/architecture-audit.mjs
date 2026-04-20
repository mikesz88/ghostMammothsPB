import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

const SEARCH_DIRS = ["app", "src", "components", "hooks", "lib", "server"]
  .map((dir) => path.join(ROOT, dir))
  .filter((dir) => fs.existsSync(dir));

const warnings = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (
      entry.name.startsWith(".") ||
      ["node_modules", ".next", "dist", "build", "coverage", "out"].includes(
        entry.name,
      )
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (TARGET_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function addWarning(filePath, message) {
  warnings.push(`${path.relative(ROOT, filePath)}: ${message}`);
}

function getLineCount(content) {
  return content.split("\n").length;
}

function checkPageClientUsage(filePath, content) {
  if (
    !filePath.endsWith(`${path.sep}page.tsx`) &&
    !filePath.endsWith(`${path.sep}page.ts`)
  ) {
    return;
  }

  if (content.includes('"use client"') || content.includes("'use client'")) {
    addWarning(
      filePath,
      'page file uses "use client" — consider extracting interactivity into a smaller client component',
    );
  }
}

function checkLargeFiles(filePath, content) {
  const lineCount = getLineCount(content);

  if (lineCount > 300) {
    addWarning(filePath, `very large file (${lineCount} lines)`);
  } else if (lineCount > 200) {
    addWarning(filePath, `large file (${lineCount} lines)`);
  }
}

function checkVagueNaming(filePath, content) {
  const patterns = [
    /\bconst\s+data\b/,
    /\blet\s+data\b/,
    /\bconst\s+stuff\b/,
    /\blet\s+stuff\b/,
    /\bconst\s+handler\s*=/,
    /\bfunction\s+handler\b/,
    /\bconst\s+util\b/,
    /\bfunction\s+util\b/,
    /\bconst\s+temp\b/,
    /\bconst\s+misc\b/,
  ];

  for (const pattern of patterns) {
    if (pattern.test(content)) {
      addWarning(
        filePath,
        "contains vague naming that should be improved during refactors",
      );
      break;
    }
  }
}

function checkServerImportsInClientishFiles(filePath, content) {
  const isComponent = filePath.includes(`${path.sep}components${path.sep}`);
  const isHook = filePath.includes(`${path.sep}hooks${path.sep}`);

  if (!isComponent && !isHook) return;

  // Escape / so @/server does not end the regex literal
  const patterns = [
    /from\s+["']@\/server\//,
    /from\s+["']@\/src\/server\//,
  ];

  for (const pattern of patterns) {
    if (pattern.test(content)) {
      addWarning(
        filePath,
        "imports a server-only module from a component or hook — move behind a server/service boundary when refactoring",
      );
      break;
    }
  }
}

function checkPersistenceInComponents(filePath, content) {
  const isComponent = filePath.includes(`${path.sep}components${path.sep}`);
  if (!isComponent) return;

  const suspiciousPatterns = [
    /\bprisma./,
    /\bdb./,
    /\bstripe./,
    /\bSELECT\b/i,
    /\bINSERT\b/i,
    /\bUPDATE\b/i,
    /\bDELETE\b/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      addWarning(
        filePath,
        "possible business/persistence logic inside a component — review during phased refactor",
      );
      break;
    }
  }
}

function main() {
  const files = SEARCH_DIRS.flatMap(walk);

  for (const filePath of files) {
    const content = readFile(filePath);

    checkPageClientUsage(filePath, content);
    checkLargeFiles(filePath, content);
    checkVagueNaming(filePath, content);
    checkServerImportsInClientishFiles(filePath, content);
    checkPersistenceInComponents(filePath, content);
  }

  if (warnings.length === 0) {
    console.log("Architecture audit: no issues found.");
    return;
  }

  console.log("\nArchitecture audit report:\n");
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }

  console.log(`\nTotal findings: ${warnings.length}\n`);
}

main();
