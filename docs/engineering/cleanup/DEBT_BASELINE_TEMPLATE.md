# Debt baseline template

**Date:** YYYY-MM-DD  
**Owner:** &lt;name&gt;

## Commands

- `npm run architecture:audit` — capture top warnings
- `npm run lint` — may be noisy; track trend, not one-time absolutes
- `npm run typecheck`

## Snapshot table (fill in)

| Signal | Count | Notes |
| --- | ---: | --- |
| `use client` in `app/**/page.*` | | |
| `any` occurrences | | |
| Files > 300 lines | | from audit |
| Hotspot: `app/actions/queue.ts` lines | | |
| Hotspot: `app/actions/notifications.ts` lines | | |

## Top 10 targets (ordered)

1.
2.
3.
4.
5.
6.
7.
8.
9.
10.

## Exit criteria for baseline phase

- Two devs agree on hotspot ownership + merge protocol
- First extraction PR merged with documented verification
