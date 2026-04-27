# Phase 0 — refactor inventory (hybrid)

**Phase 1 is active** — for **new or touched** routes and client UI, follow [`phase-1-rsc-conventions.md`](phase-1-rsc-conventions.md) and domain folders under `components/`. **Phase 2** (member `app/events/[id]`) is **complete**; see [`phase-2-event-detail-walkthrough.md`](phase-2-event-detail-walkthrough.md). **Phase 3** (admin `app/admin/events/[id]`) is **complete**; see [`phase-3-admin-event-walkthrough.md`](phase-3-admin-event-walkthrough.md). **Phase 4** (shared event/admin extraction for those routes) is **complete**; see [`phase-4-shared-event-admin-extraction.md`](phase-4-shared-event-admin-extraction.md). **Phase 5** (admin dashboard, users list, user detail, email-stats) is **complete**; see [`phase-5-admin-routes-walkthrough.md`](phase-5-admin-routes-walkthrough.md). **Phase 6** (settings, membership, auth) is **complete**; see [`phase-6-settings-membership-auth-walkthrough.md`](phase-6-settings-membership-auth-walkthrough.md). **Phase 7** (action layer split: queue + notifications) is **complete**; see [`phase-7-action-layer-walkthrough.md`](phase-7-action-layer-walkthrough.md).

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

**Priority gist:** **Phase 8** is **complete** (Stripe webhooks, email split, `lib/queue/algorithm/*`). **Phase 9 (optional)** = public/marketing shell — see [`phase-9-public-marketing-shell.md`](phase-9-public-marketing-shell.md). **P1** = event queue UI, test-helpers, optional split of `lib/stripe/webhooks/handlers.ts`. **P2** = Phase 9 hotspots (`app/page.tsx`, `app/events/page.tsx`, `app/about/page.tsx`, `components/ui/header.tsx`) and other small client pages.

| Path | Lines | Bucket | Auto flags | Primary tag | Priority | Target phase | Notes |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| app/events/[id]/page.tsx | ~26 | route-page | server component | server-page migration | — | **Done** | Phase 2 complete: server `loadEventDetailPageData`; client island `components/events/event-detail-client.tsx` (~205 lines). |
| app/admin/events/[id]/page.tsx | ~20 | route-page | server component | server-page migration | — | **Done** | Phase 3: server `loadAdminEventDetailPageData`; client `components/admin/events/admin-event-detail-client.tsx`. |
| components/admin/events/test-controls.tsx | ~235 | component | large | client-island extraction | — | **Done** | Phase 3: test-only; logic in `lib/hooks/use-test-controls.ts`. |
| app/actions/queue.ts | ~133 | action | — | action split | — | **Done** | Phase 7: thin actions → `lib/queue/services/*`; see [`phase-7-action-layer-walkthrough.md`](phase-7-action-layer-walkthrough.md). |
| lib/queue-manager.ts | ~99 | lib | — | service split | — | **Done** | Phase 8: thin `QueueManager` facade; logic in `lib/queue/algorithm/*`. |
| app/actions/notifications.ts | ~35 | action | — | action split | — | **Done** | Phase 7: async wrapper barrel for `"use server"`; implementations in `queue-email-notifications`, `admin-email-stats-actions`. |
| components/events/event-detail-client.tsx | ~205 | component | large | client-island extraction | P1 | — | Phase 2 island; split further only if touched (handlers/hooks already extracted). Phase 4 covered shared lib loaders/serializers, not this file. |
| lib/events/event-detail-server.ts | ~50 | lib | — | service split | P1 | **Done** | Phase 2 types + re-exports; Phase 4 shared DTO/serialize/hydrate/fetch modules — see `phase-4-shared-event-admin-extraction.md`. |
| components/queue-list.tsx | 344 | component | very large | client-island extraction | P1 | 4 | Event queue UI; shared event components. |
| components/join-queue-dialog.tsx | 263 | component | large; persistence-like patterns | client-island extraction | P1 | 4 | Queue UX; keep actions on server boundary. |
| components/court-status.tsx | 205 | component | large | client-island extraction | P1 | 4 | Court / live state; likely stays client-heavy but smaller leaves. |
| app/admin/page.tsx | ~7 | route-page | server component | server-page migration | — | **Done** | Phase 5: `loadAdminDashboardPageData` → `AdminDashboardPageClient`. |
| app/admin/users/page.tsx | ~7 | route-page | server component | server-page migration | — | **Done** | Phase 5: `loadAdminUsersPageData` → `AdminUsersPageClient`. |
| app/admin/users/[id]/page.tsx | ~17 | route-page | server component | server-page migration | — | **Done** | Phase 5: `loadAdminUserDetailPageData`, `notFound()` → `AdminUserDetailPageClient`. |
| app/admin/email-stats/page.tsx | ~24 | route-page | server component | server-page migration | — | **Done** | Phase 5: `parseEmailStatsTimeRange`, `loadAdminEmailStatsPageData` → `EmailStatsPageClient`; `lib/admin/*` stats helpers. |
| app/actions/test-helpers.ts | 405 | action | very large | action split | P1 | 3 | Test-only actions; keep behind admin/test flows; can trail Phase 3. |
| app/membership/page.tsx | ~7 | route-page | server component | server-page migration | — | **Done** | Phase 6: `loadMembershipMarketingPageData` → `MembershipMarketingPageClient`. |
| app/membership/checkout/page.tsx | ~21 | route-page | server component | server-page migration | — | **Done** | Phase 6: `loadMembershipCheckoutPageData` → `MembershipCheckoutPageClient`. |
| app/membership/success/page.tsx | ~21 | route-page | server component | server-page migration | — | **Done** | Phase 6: `loadMembershipSuccessPageData` → `MembershipSuccessPageClient`. |
| app/membership/cancel/page.tsx | ~9 | route-page | server component | server-page migration | — | **Done** | Phase 6: server shell + `MembershipCancelMainCard`. |
| app/settings/page.tsx | ~13 | route-page | server component | server-page migration | — | **Done** | Phase 6: `loadSettingsHubPageData` → `SettingsHubPageClient`. |
| app/settings/membership/page.tsx | ~7 | route-page | server component | form extraction | — | **Done** | Phase 6: `loadSettingsMembershipPageData` → `SettingsMembershipPageClient`. |
| app/settings/notifications/page.tsx | ~7 | route-page | server component | form extraction | — | **Done** | Phase 6: `loadSettingsNotificationsPageData` → `SettingsNotificationsPageClient`. |
| app/login/page.tsx | ~15 | route-page | server component | form extraction | — | **Done** | Phase 6: `AuthPageShell` + `LoginPageClient`; `lib/auth` submit + post-login nav. |
| app/signup/page.tsx | ~15 | route-page | server component | form extraction | — | **Done** | Phase 6: `SignupPageClient` + `lib/auth` sign-up flow helpers. |
| app/forgot-password/page.tsx | ~9 | route-page | server component | form extraction | — | **Done** | Phase 6: `AuthPageShell` + `ForgotPasswordPageClient`. |
| app/reset-password/page.tsx | ~10 | route-page | server component | form extraction | — | **Done** | Phase 6: `ResetPasswordPageClient`. |
| lib/membership-helpers.ts | ~162 | lib | — | service split | P1 | — | Barrel: `canUserJoinEvent`, display helpers, re-exports. Core membership row logic: `lib/membership/get-user-membership.ts` (+ helpers). |
| lib/auth-context.tsx | ~26 | lib | — | service split | — | **Done** | Phase 6: thin provider; logic in `lib/auth/*` (`useAuthSessionState`, sign-in/up factories, password actions). |
| app/api/webhooks/stripe/route.ts | ~49 | api-route | — | action split | — | **Done** | Phase 8: verify + `dispatchStripeWebhookEvent` → `lib/stripe/webhooks/*`. |
| lib/email/resend.ts | ~170 | lib | — | service split | — | **Done** | Phase 8: transport + retry; templates `lib/email/templates/queue-notifications.ts`. |
| lib/stripe/webhooks/handlers.ts | ~281 | lib | large | service split | P1 | — | Phase 8 follow-up: optional split by event family (`checkout`, `subscription`, `invoice`). |
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
