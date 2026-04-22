# Roadmap: 30 / 60 / 90 days

## Days 0–30: Stabilize and ratchet foundations

- Establish debt baseline ([DEBT_BASELINE_TEMPLATE.md](./DEBT_BASELINE_TEMPLATE.md))
- Agree hotspot ownership for `queue.ts` / `notifications.ts`
- First 2–4 extraction PRs from `app/actions/queue.ts` into `lib/...`
- Eliminate the worst `"use client"` page cases by extracting islands

## Days 31–60: Expand coverage and tighten changed-file discipline

- Continue queue domain decomposition
- Reduce `notifications.ts` complexity by splitting error formatting / send paths
- Burn down top architecture-audit warnings systematically

## Days 61–90: Tighten enforcement (without blocking legacy)

- Convert “warnings for legacy” into “errors for touched files” where feasible
- Expand tests around extracted domain logic
- Re-evaluate thresholds (complexity/line limits) based on real pain
