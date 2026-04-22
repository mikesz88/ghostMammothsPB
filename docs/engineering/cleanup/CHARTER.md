# Cleanup charter

## Purpose

Improve maintainability and Next.js/TypeScript best practices without destabilizing production behavior.

## Principles

1. **Correctness first** — preserve behavior unless explicitly changing product requirements.
2. **Incrementalism** — small PRs, frequent merges, continuous integration.
3. **Ratchet** — stop adding new debt even while legacy debt exists.
4. **Architecture** — business logic belongs in services; UI renders; server actions orchestrate.

## Non-goals (for this program)

- “Rewrite the app” in one branch
- Big-bang formatting-only PRs across the whole repo (high conflict, low signal)
- Chasing perfect lint cleanliness everywhere before the ratchet is in place

## Definitions

- **Behavior-preserving refactor** — externally observable behavior is unchanged for supported flows.
- **Structural refactor** — moves code across files/modules without changing logic.
- **Guardrail** — automated or procedural rule that prevents regression of standards.

## Success metrics (examples)

Track weekly:

- Count of `"use client"` in `app/**/page.*`
- Count of `any` usages (and trend)
- Top N files by line count / ESLint complexity findings
- Number of new suppressions (`eslint-disable`, `@ts-expect-error`)

## Governance

- Every refactor PR must state: risk, scope, invariants, verification performed.
- If two PRs touch the same hotspot file, follow [TWO_DEV_OPERATING_AGREEMENT.md](./TWO_DEV_OPERATING_AGREEMENT.md).
- Do not loosen global ESLint Phase 1 caps or TypeScript `strict` in a drive-by; see [LINT_POLICY_LOCK.md](../LINT_POLICY_LOCK.md) and `npm run lint:policy`.
