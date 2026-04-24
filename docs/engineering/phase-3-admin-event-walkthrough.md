# Phase 3 walkthrough — `app/admin/events/[id]/page.tsx`

**Status: complete (April 2026).** This doc maps the **delivered** admin event console layout so future work (Phase 7 queue actions, etc.) can find boundaries quickly. **Phase 4** shared loaders/serializers for member + admin event detail are **complete** — see [`phase-4-shared-event-admin-extraction.md`](phase-4-shared-event-admin-extraction.md).

## Delivered layout

| Area | Location | Role |
| --- | --- | --- |
| Route shell | `app/admin/events/[id]/page.tsx` | Async Server Component: `loadAdminEventDetailPageData`, `notFound()`, passes serialized props to the client island. No file-level `"use client"`. |
| Client island | `components/admin/events/admin-event-detail-client.tsx` | React Query for queue, composition of panels + optional test controls. |
| Presentational panels | `components/admin/events/admin-event-header-card.tsx`, `admin-event-courts-panel.tsx`, `admin-event-queue-panel.tsx` | Header stats, courts + `CourtStatus`, queue list + actions. |
| Test UI | `components/admin/events/test-controls.tsx` | Test-event-only card; calls `useTestControls` from `lib/hooks`. |
| Realtime + actions | `lib/hooks/use-admin-event-detail-realtime.ts`, `use-admin-event-detail-actions.ts` | Supabase channels for `queue_entries` / `court_assignments`; assign next, clear queue, remove entry, end game (toasts + server actions). |
| Test helpers hook | `lib/hooks/use-test-controls.ts` | State + handlers for dummy queue / rotation / team size / court count (test-helpers actions). |
| Server payload | `lib/admin/admin-event-detail-server.ts` | Auth + load; serializable props for the client. |
| Hydration / mapping | `lib/admin/hydrate-admin-event-detail.ts`, `lib/admin/map-admin-court-assignments.ts` | Parse server JSON into `Event`, `CourtAssignment[]`, queue rows. |
| Copy helpers | `lib/admin/admin-assign-next-copy.ts`, `lib/admin/admin-end-game-toast-copy.ts` | Shared admin toast / label strings. |

## Design choices

* **Server-first page:** Initial event, queue snapshot, and assignments are loaded on the server; the client refetches assignments over Realtime and invalidates React Query when the queue table changes.
* **Hooks under `lib/hooks/`:** Matches Phase 2 (`use-event-detail-*`); keeps `components/admin/events/*` mostly presentational and avoids architecture-audit “persistence in components” noise for Supabase browser usage.
* **Out of scope for Phase 3:** Broad `app/actions/queue.ts` split, queue algorithm changes, other admin dashboard routes.

## Exit criteria (checked)

* Admin event `page.tsx` is a Server Component.
* Interactive regions are isolated (panels, test controls, hooks).
* Queue and assignment behavior preserved relative to the pre-refactor admin page.

Phase **4** next: shared loaders/mappers between member `app/events/[id]` and admin event routes where duplication warrants it.
