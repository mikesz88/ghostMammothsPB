# Codebase cleanup program (handoff index)

This folder is the shared playbook for incremental refactors.

## Read first

- [CHARTER.md](./CHARTER.md) — goals, non-goals, success metrics, governance
- [TWO_DEV_OPERATING_AGREEMENT.md](./TWO_DEV_OPERATING_AGREEMENT.md) — how two engineers avoid collisions
- [REFACTOR_PLAYBOOK.md](./REFACTOR_PLAYBOOK.md) — safe extraction steps + PR shape
- [ROADMAP_30_60_90.md](./ROADMAP_30_60_90.md) — phased plan
- [DEBT_BASELINE_TEMPLATE.md](./DEBT_BASELINE_TEMPLATE.md) — how we measure progress
- [LINT_POLICY_LOCK.md](../LINT_POLICY_LOCK.md) — ESLint Phase 1 / `strict` guardrails

## Existing repo standards (authoritative)

- `.cursor/rules.mdc`
- `docs/engineering/cursor-enforcement-prompt.md`
- `docs/engineering/pre-pr-self-check.md`
- `.github/pull_request_template.md`
- `docs/engineering/LINT_POLICY_LOCK.md`

## Local gates

- `npm run pr` — lint, tooling policy guard, typecheck, architecture audit report
- `npm run lint:policy` — assert Phase 1 ESLint caps and `tsconfig` strictness (see `script/tooling-policy-guard.mjs`)
- `npm run architecture:audit` — non-blocking report today; treat findings as backlog signals

## Pilot hotspots (expected high conflict)

- `app/actions/queue.ts` — typical focus for queue domain work (anyone may touch when needed)
- `app/actions/notifications.ts` — typical focus for notifications (same)
- Any `app/**/page.tsx` using `"use client"` — prefer server page + small client islands
