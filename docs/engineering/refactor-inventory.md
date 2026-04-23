# Phase 0 — refactor inventory (hybrid)

**Phase 1 is active** — for **new or touched** routes and client UI, follow [`phase-1-rsc-conventions.md`](phase-1-rsc-conventions.md) and domain folders under `components/`. **Phase 2** (member `app/events/[id]`) is **complete**; see [`phase-2-event-detail-walkthrough.md`](phase-2-event-detail-walkthrough.md). **Phase 3** (admin `app/admin/events/[id]`) is **complete**; see [`phase-3-admin-event-walkthrough.md`](phase-3-admin-event-walkthrough.md).

This doc is **team-owned**. The repo also contains a **machine-generated snapshot** you refresh when the map drifts.

## Workflow

1. **Refresh metrics:** `npm run inventory:phase0` → updates [`refactor-inventory.snapshot.md`](refactor-inventory.snapshot.md).
2. **Prioritize:** Decide which rows matter next; copy them into the **Team backlog** table below (or reference paths only).
3. **Tag:** Set **Primary tag** and **Target phase** using the taxonomy below. Multiple tags may apply; pick one **primary** for ordering.
4. **Agree:** Align with the phased plan ([`.cursor/plans/rules.mdc_phased_refactor_c02ab9c1.plan.md`](../../.cursor/plans/rules.mdc_phased_refactor_c02ab9c1.plan.md)) before starting Phase 1+ route work.

Regenerating the snapshot **overwrites** the snapshot file only — not this file. If you inlined rows here and want to refresh metrics, update line counts from the new snapshot or re-copy rows.

**Buckets** in the snapshot: `route-page`, `app-local` (tsx/ts under `app/` that isn’t a `page` or `route`), `api-route`, `action`, `component`, `hook`, `lib`, `server`, `other`.

## Taxonomy (primary tag)

| Tag | Use when |
| --- | --- |
| **server-page migration** | `page.tsx` should be a Server Component; data fetch moves to server. |
| **client-island extraction** | Interactivity / Realtime / browser APIs belong in small leaf components. |
| **form extraction** | Forms + validation clusters should move out of oversized parents. |
| **action split** | `app/actions/*` (or route handlers) doing too much — thin boundary, delegate to services. |
| **service split** | `lib/*` (or domain modules) need clearer responsibilities or smaller modules. |
| **shared UI split** | Reusable UI or duplicated patterns deserve shared components. |

## Priority (suggested scale)

| Priority | Meaning |
| --- | --- |
| **P0** | Next up; blocks or high-risk; aligns with current phase. |
| **P1** | Soon; hotspot or large file touched by active work. |
| **P2** | Backlog; improve when adjacent. |

## Target phase

Use the refined plan phase numbers (e.g. **2** = member event detail, **3** = admin event console, **7–8** = actions / integrations). Put **—** if unsure.

## Team backlog

Seeded from [`refactor-inventory.snapshot.md`](refactor-inventory.snapshot.md) (refresh with `npm run inventory:phase0`). Reconcile line counts here when the map drifts.

**Priority gist:** **P0** = queue spine (`queue.ts` / `queue-manager`) for explicit Phase 7–8 work. (**Phases 2–3** event detail + admin event console are done.) **P1** = Phase 4 shared event/admin extraction when touching both routes, notifications, event queue UI, admin dashboard/users/email, membership/settings/auth, Stripe/email integration. **P2** = marketing/public shell, shared header/dialogs, small client pages.

| Path | Lines | Bucket | Auto flags | Primary tag | Priority | Target phase | Notes |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| app/events/[id]/page.tsx | ~26 | route-page | server component | server-page migration | — | **Done** | Phase 2 complete: server `loadEventDetailPageData`; client island `components/events/event-detail-client.tsx` (~205 lines). |
| app/admin/events/[id]/page.tsx | ~20 | route-page | server component | server-page migration | — | **Done** | Phase 3: server `loadAdminEventDetailPageData`; client `components/admin/events/admin-event-detail-client.tsx`. |
| components/admin/events/test-controls.tsx | ~235 | component | large | client-island extraction | — | **Done** | Phase 3: test-only; logic in `lib/hooks/use-test-controls.ts`. |
| app/actions/queue.ts | 1243 | action | very large | action split | P0 | 7 | Hotspot — thin actions → services; coordinate per two-dev agreement. |
| lib/queue-manager.ts | 348 | lib | very large | service split | P0 | 7–8 | Algorithm/domain; align with Phase 7–8, not casual edits. |
| app/actions/notifications.ts | 503 | action | very large | action split | P1 | 7 | Email/send paths; pair with `lib/email/resend` in Phase 8. |
| components/events/event-detail-client.tsx | ~205 | component | large | client-island extraction | P1 | 4 | Phase 2 island; split further only if touched (handlers/hooks already extracted). |
| lib/events/event-detail-server.ts | ~200 | lib | large | service split | P1 | 4 | Phase 2 server loader; trim or share mappers when admin/event loaders consolidate. |
| components/queue-list.tsx | 344 | component | very large | client-island extraction | P1 | 4 | Event queue UI; shared event components. |
| components/join-queue-dialog.tsx | 263 | component | large; persistence-like patterns | client-island extraction | P1 | 4 | Queue UX; keep actions on server boundary. |
| components/court-status.tsx | 205 | component | large | client-island extraction | P1 | 4 | Court / live state; likely stays client-heavy but smaller leaves. |
| app/admin/page.tsx | 589 | route-page | very large; `"use client"` page | server-page migration | P1 | 5 | Admin dashboard shell. |
| app/admin/users/page.tsx | 428 | route-page | very large; `"use client"` page | server-page migration | P1 | 5 | Admin users list. |
| app/admin/users/[id]/page.tsx | 443 | route-page | very large; `"use client"` page | server-page migration | P1 | 5 | Admin user detail. |
| app/admin/email-stats/page.tsx | 452 | route-page | very large; `"use client"` page | server-page migration | P1 | 5 | Email stats / reporting UI. |
| app/actions/test-helpers.ts | 405 | action | very large | action split | P1 | 3 | Test-only actions; keep behind admin/test flows; can trail Phase 3. |
| app/membership/page.tsx | 478 | route-page | very large; `"use client"` page | server-page migration | P1 | 6 | Membership landing. |
| app/membership/checkout/page.tsx | 352 | route-page | very large; `"use client"` page | server-page migration | P1 | 6 | Stripe checkout surface. |
| app/membership/success/page.tsx | 226 | route-page | large; `"use client"` page | server-page migration | P1 | 6 | Post-checkout. |
| app/membership/cancel/page.tsx | 44 | route-page | `"use client"` page | server-page migration | P2 | 6 | Small; batch with Phase 6 membership. |
| app/settings/page.tsx | 450 | route-page | very large; `"use client"` page | server-page migration | P1 | 6 | Settings hub. |
| app/settings/membership/page.tsx | 400 | route-page | very large; `"use client"` page | form extraction | P1 | 6 | Membership sub-settings. |
| app/settings/notifications/page.tsx | 319 | route-page | very large; `"use client"` page | form extraction | P1 | 6 | Notification prefs. |
| app/login/page.tsx | 258 | route-page | large; `"use client"` page | form extraction | P1 | 6 | Auth forms — client children pattern. |
| app/signup/page.tsx | 309 | route-page | very large; `"use client"` page | form extraction | P1 | 6 | |
| app/forgot-password/page.tsx | 110 | route-page | `"use client"` page | form extraction | P2 | 6 | |
| app/reset-password/page.tsx | 209 | route-page | large; `"use client"` page | form extraction | P2 | 6 | |
| lib/membership-helpers.ts | ~162 | lib | — | service split | P1 | 6 | Barrel: `canUserJoinEvent`, display helpers, re-exports. Core membership row logic: `lib/membership/get-user-membership.ts` (+ helpers). |
| lib/auth-context.tsx | 235 | lib | large | service split | P1 | 6 | Client auth provider — scope vs server session pattern. |
| app/api/webhooks/stripe/route.ts | 364 | api-route | very large | action split | P1 | 8 | Thin route → `lib/stripe` per plan. |
| lib/email/resend.ts | 360 | lib | very large | service split | P1 | 8 | Templates vs send split. |
| components/ui/header.tsx | 374 | component | very large; persistence-like patterns | shared UI split | P2 | 9 | Public shell; server parent + small client pieces. |
| components/create-event-dialog.tsx | 255 | component | large; persistence-like patterns | shared UI split | P2 | 4–5 | Admin/event dialogs — candidate for `components/admin/events/`. |
| components/edit-event-dialog.tsx | 213 | component | large; persistence-like patterns | shared UI split | P2 | 4–5 | |
| components/ui/dropdown-menu.tsx | 202 | component | large; persistence-like patterns | shared UI split | P2 | 1–4 | Radix wrapper; often low ROI unless touched. |
| app/page.tsx | 204 | route-page | large; `"use client"` page | server-page migration | P2 | 9 | Home — optional public shell phase. |
| app/events/page.tsx | 182 | route-page | `"use client"` page | server-page migration | P2 | 9 | Events list; can precede or follow Phase 2. |
| app/about/page.tsx | 210 | route-page | large; `"use client"` page | server-page migration | P2 | 9 | |
| app/search/page.tsx | 57 | route-page | `"use client"` page | server-page migration | P2 | 9 | Small page. |

---

## Related tooling

- `npm run architecture:audit` — warn-only structural findings (pages, size, imports).
- `npm run lint` — ESLint warnings for complexity / `max-lines` / page `use client`.
- Phase 0 exit criteria: shared map, warnings non-blocking, **no new** full-client `page.tsx` on new or touched routes.
