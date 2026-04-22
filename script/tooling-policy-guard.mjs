/**
 * Light-touch guard aligned with eslint Phase 1 (readability / complexity caps).
 * Fails when global policy is loosened — not when normal application code changes.
 *
 * Intentional policy change: team approval + update this script in the same PR
 * so the new bar is explicit.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ESLINT_CONFIG = path.join(ROOT, "eslint.config.mjs");
const TSCONFIG = path.join(ROOT, "tsconfig.json");

/** @type {{ name: string; test: (src: string) => boolean }[]} */
const eslintExpectations = [
  {
    name: 'complexity remains ["warn", 12]',
    test: (s) => /complexity:\s*\[\s*["']warn["']\s*,\s*12\s*\]/.test(s),
  },
  {
    name: 'max-params remains ["warn", 5]',
    test: (s) =>
      /["']max-params["']\s*:\s*\[\s*["']warn["']\s*,\s*5\s*\]/.test(s),
  },
  {
    name: 'max-depth remains ["warn", 4]',
    test: (s) =>
      /["']max-depth["']\s*:\s*\[\s*["']warn["']\s*,\s*4\s*\]/.test(s),
  },
  {
    name: "max-lines block still uses max: 250",
    test: (s) => /"max-lines"\s*:\s*\[[\s\S]{0,1200}?max:\s*250\s*,/.test(s),
  },
  {
    name: 'unused-imports/no-unused-imports remains "error"',
    test: (s) =>
      /["']unused-imports\/no-unused-imports["']\s*:\s*["']error["']/.test(s),
  },
];

function checkEslint() {
  if (!fs.existsSync(ESLINT_CONFIG)) {
    return ["eslint.config.mjs not found"];
  }
  const src = fs.readFileSync(ESLINT_CONFIG, "utf8");
  const failures = [];
  for (const { name, test } of eslintExpectations) {
    if (!test(src)) failures.push(name);
  }
  return failures;
}

function checkTsconfig() {
  if (!fs.existsSync(TSCONFIG)) {
    return ["tsconfig.json not found"];
  }
  try {
    const raw = fs.readFileSync(TSCONFIG, "utf8");
    const json = JSON.parse(raw);
    if (json.compilerOptions?.strict !== true) {
      return ["tsconfig.json: compilerOptions.strict must remain true"];
    }
  } catch (e) {
    return [`tsconfig.json: invalid JSON (${e.message})`];
  }
  return [];
}

function main() {
  const failures = [...checkEslint(), ...checkTsconfig()];

  if (failures.length > 0) {
    console.error("Tooling policy guard failed:\n");
    for (const f of failures) {
      console.error(`  - ${f}`);
    }
    console.error(
      "\nThese checks only catch loosened global ESLint Phase 1 caps / strict mode.\n" +
        "To change the bar: update script/tooling-policy-guard.mjs in the same PR with team approval.\n",
    );
    process.exit(1);
  }

  console.log("Tooling policy guard: OK");
}

main();
