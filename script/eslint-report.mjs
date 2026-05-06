/**
 * Aggregates ESLint JSON output by rule and by file.
 *
 * Usage:
 *   npm run lint:report
 *   node script/eslint-report.mjs --json-out eslint-report.summary.json
 *
 * Exit code matches ESLint (errors → non-zero; warnings alone → 0 unless lint script uses --max-warnings 0).
 */

import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const jsonOut = argv.includes("--json-out")
    ? argv[argv.indexOf("--json-out") + 1]
    : null;
  if (argv.includes("--json-out") && (!jsonOut || jsonOut.startsWith("--"))) {
    console.error("Usage: --json-out <path>");
    process.exit(2);
  }
  return { jsonOut };
}

function runEslintJson() {
  const eslintJs = join(root, "node_modules/eslint/bin/eslint.js");
  const args = [eslintJs, ".", "--format", "json"];
  const bin = process.execPath;
  let r = spawnSync(bin, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 100 * 1024 * 1024,
  });

  if (r.error && r.error.code === "ENOENT") {
    r = spawnSync("npx", ["eslint", ".", "--format", "json"], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 100 * 1024 * 1024,
      shell: false,
    });
  } else if (r.error) {
    throw r.error;
  }

  const text = (r.stdout ?? "").trim();
  if (!text) {
    console.error(
      r.stderr || "ESLint produced no JSON output. Is eslint installed?",
    );
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error(
      "Failed to parse ESLint JSON. First 500 chars:\n",
      text.slice(0, 500),
    );
    process.exit(1);
  }

  return { data, eslintStatus: r.status ?? 0 };
}

function bumpRule(byRule, ruleId, isError) {
  if (!byRule.has(ruleId)) {
    byRule.set(ruleId, { errors: 0, warnings: 0 });
  }
  const rc = byRule.get(ruleId);
  if (isError) rc.errors += 1;
  else rc.warnings += 1;
}

function bumpFile(byFile, rel, isError) {
  if (!byFile.has(rel)) {
    byFile.set(rel, { errors: 0, warnings: 0 });
  }
  const fc = byFile.get(rel);
  if (isError) fc.errors += 1;
  else fc.warnings += 1;
}

function aggregate(results) {
  /** @type {Map<string, { errors: number; warnings: number }>} */
  const byRule = new Map();
  /** @type {Map<string, { errors: number; warnings: number }>} */
  const byFile = new Map();

  let totalErrors = 0;
  let totalWarnings = 0;
  let filesWithMessages = 0;

  for (const file of results) {
    const rel = file.filePath?.replace(root + "/", "") ?? file.filePath;
    if (!file.messages?.length) continue;
    filesWithMessages += 1;

    for (const m of file.messages) {
      const ruleId = m.ruleId ?? "(no rule id)";
      const isError = m.severity === 2;
      if (isError) totalErrors += 1;
      else totalWarnings += 1;
      bumpRule(byRule, ruleId, isError);
      bumpFile(byFile, rel, isError);
    }
  }

  return {
    byRule,
    byFile,
    totalErrors,
    totalWarnings,
    filesWithMessages,
    filesLinted: results.length,
  };
}

function printTable(title, rows, columns) {
  console.log(`\n${title}`);
  const widths = columns.map((c) =>
    Math.max(c.label.length, ...rows.map((r) => String(r[c.key]).length)),
  );
  const header = columns
    .map((c, i) => c.label.padEnd(widths[i]))
    .join("  ");
  console.log(header);
  console.log(columns.map((_, i) => "-".repeat(widths[i])).join("  "));
  for (const row of rows) {
    console.log(
      columns.map((c, i) => String(row[c.key]).padEnd(widths[i])).join("  "),
    );
  }
}

function main() {
  const { jsonOut } = parseArgs(process.argv.slice(2));
  const { data, eslintStatus } = runEslintJson();
  const agg = aggregate(data);

  const ruleRows = [...agg.byRule.entries()]
    .map(([ruleId, c]) => ({
      ruleId,
      errors: c.errors,
      warnings: c.warnings,
      total: c.errors + c.warnings,
    }))
    .sort((a, b) => b.total - a.total || a.ruleId.localeCompare(b.ruleId));

  const fileRows = [...agg.byFile.entries()]
    .map(([filePath, c]) => ({
      filePath,
      errors: c.errors,
      warnings: c.warnings,
      total: c.errors + c.warnings,
    }))
    .sort((a, b) => b.total - a.total || a.filePath.localeCompare(b.filePath));

  console.log("ESLint aggregate report");
  console.log(
    `Files linted: ${agg.filesLinted}  |  Files with messages: ${agg.filesWithMessages}`,
  );
  console.log(
    `Totals: ${agg.totalErrors} error(s), ${agg.totalWarnings} warning(s)  |  ESLint exit: ${eslintStatus}`,
  );

  if (ruleRows.length) {
    printTable("By rule (descending count)", ruleRows, [
      { key: "ruleId", label: "ruleId" },
      { key: "errors", label: "errors" },
      { key: "warnings", label: "warnings" },
      { key: "total", label: "total" },
    ]);
  }

  if (fileRows.length) {
    printTable("By file (descending count)", fileRows, [
      { key: "filePath", label: "filePath" },
      { key: "errors", label: "errors" },
      { key: "warnings", label: "warnings" },
      { key: "total", label: "total" },
    ]);
  }

  if (!ruleRows.length) {
    console.log("\nNo ESLint messages — clean run.");
  }

  if (jsonOut) {
    const payload = {
      generatedAt: new Date().toISOString(),
      eslintExitCode: eslintStatus,
      totals: {
        errors: agg.totalErrors,
        warnings: agg.totalWarnings,
        filesLinted: agg.filesLinted,
        filesWithMessages: agg.filesWithMessages,
      },
      byRule: Object.fromEntries(
        [...agg.byRule.entries()].sort(
          (a, b) =>
            b[1].errors +
            b[1].warnings -
            (a[1].errors + a[1].warnings),
        ),
      ),
      byFile: Object.fromEntries(
        [...agg.byFile.entries()].sort(
          (a, b) =>
            b[1].errors + b[1].warnings - (a[1].errors + a[1].warnings),
        ),
      ),
    };
    const outPath = isAbsolute(jsonOut) ? jsonOut : resolve(root, jsonOut);
    writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
    console.log(`\nWrote summary JSON: ${outPath}`);
  }

  process.exit(eslintStatus === 0 ? 0 : 1);
}

main();
