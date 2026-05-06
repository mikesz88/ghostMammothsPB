# Phase 4 — shared event / admin extraction

**Status: complete (April 2026).** Behavior-neutral consolidation of **member** `app/events/[id]` and **admin** `app/admin/events/[id]` server data paths: shared types, fetches, serialization, hydration, and one canonical list for `player1`–`player8` on court assignments.

Phased plan: [`.cursor/plans/rules.mdc_phased_refactor_c02ab9c1.plan.md`](../../.cursor/plans/rules.mdc_phased_refactor_c02ab9c1.plan.md).

## PR-sized steps (delivered)

| PR | Focus |
| --- | --- |
| 1 | Shared wire DTOs: [`lib/events/event-detail-shared-dto.ts`](../../lib/events/event-detail-shared-dto.ts) (`EventDetailSharedSerializedUser`, event core, court players). Member/admin-specific types stay in `event-detail-server.ts` / `hydrate-admin-event-detail.ts`. |
| 2 | Single event row read: [`lib/events/fetch-event-row-by-id.ts`](../../lib/events/fetch-event-row-by-id.ts) — used by `event-detail-load.ts` and `load-admin-event-detail-data.ts` (mappers unchanged). |
| 3 | Split court-assignment fetches: [`lib/events/fetch-open-court-assignments-for-event-detail.ts`](../../lib/events/fetch-open-court-assignments-for-event-detail.ts), [`lib/admin/fetch-court-assignments-for-admin-event-detail.ts`](../../lib/admin/fetch-court-assignments-for-admin-event-detail.ts) (same queries as before). |
| 4 | Shared serializers: [`lib/events/event-detail-serialize-shared.ts`](../../lib/events/event-detail-serialize-shared.ts); member [`event-detail-serialize.ts`](../../lib/events/event-detail-serialize.ts) adds `time` / `numCourts`; admin queue/assignments use shared pieces in `hydrate-admin-event-detail.ts`. |
| 5 | Shared hydrators: [`lib/events/event-detail-hydrate-shared.ts`](../../lib/events/event-detail-hydrate-shared.ts); member [`hydrate-event-detail.ts`](../../lib/events/hydrate-event-detail.ts) adds `time` / `numCourts`. |
| 6 | Canonical slots: [`lib/events/court-assignment-player-slots.ts`](../../lib/events/court-assignment-player-slots.ts) — used by serialize/hydrate shared modules and [`map-admin-court-assignments.ts`](../../lib/admin/map-admin-court-assignments.ts), [`map-court-assignment-players.ts`](../../lib/events/map-court-assignment-players.ts). |

## Intentional differences (unchanged)

* **Member** serialized event includes optional **`time`** / **`numCourts`**; **admin** event wire uses shared core only.
* **Member** serialized assignments omit **`queueEntryIds`** on the wire; **admin** includes them.
* **Event row → `Event`**: `mapEventRowToEvent` (member) vs `mapAdminEventRowToEvent` (admin) remain separate (date / optional field behavior).

## Exit criteria (checked)

* Repeated event/admin server and mapping patterns live under `lib/events/` (and admin-specific fetch under `lib/admin/` where appropriate).
* Routes stay thin; no new page-level client fetch for these flows.
* Later phases (5–9) can import stable helpers instead of copying queries or player-slot lists.

## Next phase pointer

**Phase 5** (admin dashboard, users list, user detail, email-stats) is **complete** — see [`phase-5-admin-routes-walkthrough.md`](phase-5-admin-routes-walkthrough.md).

**Phase 6** (settings, membership, auth) is **complete** — see [`phase-6-settings-membership-auth-walkthrough.md`](phase-6-settings-membership-auth-walkthrough.md).
