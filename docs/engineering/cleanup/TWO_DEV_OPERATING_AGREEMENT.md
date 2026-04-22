# Two-developer operating agreement (merge safety)

## Default focus (not exclusive)

It is fine to touch any part of the codebase when the work requires it. In practice, one person often leads **queue** work (`app/actions/queue.ts` and related paths) and the other **notifications** (`app/actions/notifications.ts` and related paths). That split is **convenience**, not a hard boundary.

## When to coordinate (hotspots)

- **Hotspot files** (large, high churn): use a **lock note** or quick sync when **both** might edit the **same file** in the same window — especially during extraction refactors.
- **Non-hotspot work** proceeds in parallel without special coordination.

## Hotspot list (starting point)

- `app/actions/queue.ts` — coordinate when two people are actively changing it; prefer **single-writer** during a tight extraction wave
- `app/actions/notifications.ts` — same
- Any other contested file: agree who merges first or split the PR

## Branching and PR sizing

- Prefer **short-lived branches** (1–3 days).
- Target **≤ ~400 LOC changed** per refactor PR when possible (excluding generated files).
- If a PR grows large, split by **extract function/module** boundaries.

## Conflict avoidance rules

1. Before starting work on a hotspot, post or check a **lock note** in your tracker:
   - file(s)
   - objective
   - ETA
2. If another dev needs the same file at the same time:
   - **Option A:** sequence work (simplest for large action files)
   - **Option B:** one dev rebases on the other’s merged extraction PR

## Merge order preference

1. Merge **pure extractions** first (no behavior change)
2. Then merge **behavior changes** (if any)

## Communication template (copy/paste)

```text
Working on: app/actions/queue.ts
Goal: extract <name> into lib/... (behavior-preserving)
ETA: <date>
Out of scope: <...>
Review focus: <invariants / tests>
```

## Agent and human rule

Agents must follow the same lock protocol: do not start parallel edits on the hotspot without explicit coordination.
