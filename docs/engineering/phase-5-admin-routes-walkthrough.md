# Phase 5 — admin dashboard, users, email stats

**Status: complete (April 2026).** The four admin **data** routes called out in the phased plan are server-first: thin async `page.tsx` files, server loaders under `lib/admin/`, and interactive UI in `components/admin/` client islands.

Phased plan: [`.cursor/plans/rules.mdc_phased_refactor_c02ab9c1.plan.md`](../../.cursor/plans/rules.mdc_phased_refactor_c02ab9c1.plan.md).

## Routes (delivered)

| Route | Server entry | Client island |
| --- | --- | --- |
| [`app/admin/page.tsx`](../../app/admin/page.tsx) | [`loadAdminDashboardPageData`](../../lib/admin/load-admin-dashboard-page.ts) | [`AdminDashboardPageClient`](../../components/admin/dashboard/admin-dashboard-page-client.tsx) |
| [`app/admin/users/page.tsx`](../../app/admin/users/page.tsx) | [`loadAdminUsersPageData`](../../lib/admin/load-admin-users-page.ts) | [`AdminUsersPageClient`](../../components/admin/users/admin-users-page-client.tsx) |
| [`app/admin/users/[id]/page.tsx`](../../app/admin/users/[id]/page.tsx) | [`loadAdminUserDetailPageData`](../../lib/admin/load-admin-user-detail-page.ts), `notFound()` | [`AdminUserDetailPageClient`](../../components/admin/users/admin-user-detail-page-client.tsx) |
| [`app/admin/email-stats/page.tsx`](../../app/admin/email-stats/page.tsx) | [`parseEmailStatsTimeRange`](../../lib/admin/email-stats-time-range.ts), [`loadAdminEmailStatsPageData`](../../lib/admin/load-admin-email-stats-page.ts) | [`EmailStatsPageClient`](../../components/admin/email-stats/email-stats-page-client.tsx) |

**Scope note:** Phase 5 in the plan lists these four pages only. Admin **event console** work remains under Phases 3–4 (`app/admin/events/[id]`).

## Email stats lib (delivered)

Shared helpers live under `lib/admin/`: types (`email-stats-types.ts`), `fetch-email-stats.ts` (orchestrates query + aggregate), `query-email-logs-since.ts`, `map-raw-rows-to-email-logs.ts`, `aggregate-email-stats-from-logs.ts`, `normalize-stored-email-error-message.ts`, `start-date-for-email-stats-range.ts`, `email-stats-empty-stats.ts`, `email-stats-time-range.ts`. Server actions can delegate to the same fetch layer (for example `getEmailStats` in `app/actions/notifications.ts`).

Schema typing: `email_logs` is represented in [`supabase/supa-schema.ts`](../../supabase/supa-schema.ts) for typed Supabase clients (types only; not a migration).

## Exit criteria (checked)

* Admin dashboard, users list, user detail, and email-stats render initial data from the server.
* No file-level `"use client"` on those `page.tsx` files; client logic sits in leaf components and hooks.
* Data flow matches the plan: server page → props → client island → actions/hooks where needed.

## Next phase pointer

**Phase 6** — settings, membership, auth: server-first routes per plan.
