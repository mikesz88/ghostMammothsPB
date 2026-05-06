# Refactor inventory — automated snapshot

Generated: `2026-04-28T00:46:26.307Z` (run `npm run inventory:phase0` to refresh).

Rows include files with **≥200 lines** or **route `page.tsx`/`page.ts` with `"use client"`** (any size).

**Team-owned columns** are left empty here. Copy rows into `refactor-inventory.md` and fill **Primary tag**, **Priority**, **Target phase**, and **Notes** — or edit in place and merge carefully on regenerate.

### Tag options (from phased plan)

- server-page migration  
- client-island extraction  
- form extraction  
- action split  
- service split  
- shared UI split  

---

| Path | Lines | Bucket | Auto flags | Primary tag (team) | Priority (team) | Target phase (team) | Notes (team) |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| app/actions/test-helpers.ts | 405 | action | very large (300+) |  |  |  |  |
| components/queue/queue-list.tsx | 344 | component | very large (300+) |  |  |  |  |
| lib/stripe/webhooks/handlers.ts | 281 | lib | large (200+) |  |  |  |  |
| components/queue/join-queue-dialog.tsx | 263 | component | large (200+); persistence-like patterns in component |  |  |  |  |
| components/admin/dashboard/create-event-dialog.tsx | 255 | component | large (200+); persistence-like patterns in component |  |  |  |  |
| lib/queue/services/court-assignment-helpers.ts | 227 | lib | large (200+) |  |  |  |  |
| app/actions/queue-email-notifications.ts | 213 | action | large (200+) |  |  |  |  |
| components/admin/dashboard/edit-event-dialog.tsx | 213 | component | large (200+); persistence-like patterns in component |  |  |  |  |
| components/events/events-page-client.tsx | 213 | component | large (200+); persistence-like patterns in component |  |  |  |  |
| components/queue/court-status.tsx | 205 | component | large (200+) |  |  |  |  |
| components/ui/dropdown-menu.tsx | 202 | component | large (200+); persistence-like patterns in component |  |  |  |  |
| app/search/page.tsx | 57 | route-page | "use client" page |  |  |  |  |

---

*12 row(s).*
