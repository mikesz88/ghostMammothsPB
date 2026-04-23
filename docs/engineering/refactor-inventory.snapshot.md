# Refactor inventory — automated snapshot

Generated: `2026-04-23T01:57:42.449Z` (run `npm run inventory:phase0` to refresh).

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
| app/actions/queue.ts | 1243 | action | very large (300+) |  |  |  |  |
| app/admin/page.tsx | 589 | route-page | very large (300+); "use client" page |  |  |  |  |
| app/actions/notifications.ts | 503 | action | very large (300+) |  |  |  |  |
| app/membership/page.tsx | 478 | route-page | very large (300+); "use client" page |  |  |  |  |
| app/admin/email-stats/page.tsx | 452 | route-page | very large (300+); "use client" page |  |  |  |  |
| app/settings/page.tsx | 450 | route-page | very large (300+); "use client" page |  |  |  |  |
| app/admin/users/[id]/page.tsx | 443 | route-page | very large (300+); "use client" page |  |  |  |  |
| app/admin/users/page.tsx | 428 | route-page | very large (300+); "use client" page |  |  |  |  |
| app/actions/test-helpers.ts | 405 | action | very large (300+) |  |  |  |  |
| app/settings/membership/page.tsx | 400 | route-page | very large (300+); "use client" page |  |  |  |  |
| components/ui/header.tsx | 374 | component | very large (300+); persistence-like patterns in component |  |  |  |  |
| app/api/webhooks/stripe/route.ts | 364 | api-route | very large (300+) |  |  |  |  |
| lib/email/resend.ts | 360 | lib | very large (300+) |  |  |  |  |
| app/membership/checkout/page.tsx | 352 | route-page | very large (300+); "use client" page |  |  |  |  |
| lib/queue-manager.ts | 348 | lib | very large (300+) |  |  |  |  |
| components/queue-list.tsx | 344 | component | very large (300+) |  |  |  |  |
| app/settings/notifications/page.tsx | 319 | route-page | very large (300+); "use client" page |  |  |  |  |
| app/signup/page.tsx | 309 | route-page | very large (300+); "use client" page |  |  |  |  |
| components/join-queue-dialog.tsx | 263 | component | large (200+); persistence-like patterns in component |  |  |  |  |
| app/login/page.tsx | 258 | route-page | large (200+); "use client" page |  |  |  |  |
| components/create-event-dialog.tsx | 255 | component | large (200+); persistence-like patterns in component |  |  |  |  |
| components/admin/events/test-controls.tsx | 235 | component | large (200+); persistence-like patterns in component |  |  |  |  |
| lib/auth-context.tsx | 235 | lib | large (200+) |  |  |  |  |
| app/membership/success/page.tsx | 226 | route-page | large (200+); "use client" page |  |  |  |  |
| lib/hooks/use-test-controls.ts | 221 | lib | large (200+) |  |  |  |  |
| components/edit-event-dialog.tsx | 213 | component | large (200+); persistence-like patterns in component |  |  |  |  |
| app/about/page.tsx | 210 | route-page | large (200+); "use client" page |  |  |  |  |
| app/reset-password/page.tsx | 209 | route-page | large (200+); "use client" page |  |  |  |  |
| components/court-status.tsx | 205 | component | large (200+) |  |  |  |  |
| components/events/event-detail-client.tsx | 205 | component | large (200+) |  |  |  |  |
| app/page.tsx | 204 | route-page | large (200+); "use client" page |  |  |  |  |
| components/ui/dropdown-menu.tsx | 202 | component | large (200+); persistence-like patterns in component |  |  |  |  |
| lib/events/event-detail-server.ts | 200 | lib | large (200+) |  |  |  |  |
| app/events/page.tsx | 182 | route-page | "use client" page |  |  |  |  |
| app/forgot-password/page.tsx | 110 | route-page | "use client" page |  |  |  |  |
| app/search/page.tsx | 57 | route-page | "use client" page |  |  |  |  |
| app/membership/cancel/page.tsx | 44 | route-page | "use client" page |  |  |  |  |

---

*37 row(s).*
