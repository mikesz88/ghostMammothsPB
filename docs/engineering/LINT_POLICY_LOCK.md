# Lint and TypeScript policy lock

This repo uses **ESLint Phase 1** caps in `eslint.config.mjs` (complexity, file length, params, depth, plus `unused-imports` as error). TypeScript stays **`strict: true`** in `tsconfig.json`.

## What is protected

`npm run lint:policy` (`script/tooling-policy-guard.mjs`) fails CI / `npm run pr` if someone **loosens** those global defaults without updating the guard. Normal feature work in application code is unaffected.

## How to change policy intentionally

1. Discuss and get **team approval** (this is not a drive-by change).
2. Update **`eslint.config.mjs`** / **`tsconfig.json`** as needed.
3. Update **`script/tooling-policy-guard.mjs`** in the **same PR** so the new bar is explicit and reviewed.

## What the guard does not catch

- Pervasive `eslint-disable` comments or local suppressions
- Changes inside `extends` / shared presets without touching the Phase 1 block
- Every possible `compilerOptions` knob — only **`strict: true`** is enforced here

For those, rely on review, architecture audit, and the cleanup charter.

## Optional: GitHub

To require human eyes on policy files, add **`CODEOWNERS`** entries for `eslint.config.mjs` and `tsconfig.json` (use your org team or `@username` handles).
