# Phase 9 — public / marketing shell (optional)

**Status: complete (April 2026).** Server-first cleanup for **marketing-facing** routes and the shared **site header**. Steps 1–5 done, including inventory refresh ([`refactor-inventory.md`](refactor-inventory.md)).

**Prerequisite:** [Phase 8](phase-8-integration-service-cleanup.md) complete.

## Targets (current hotspots)

| Area | Primary paths |
| --- | --- |
| Home | [`app/page.tsx`](../../app/page.tsx) — server shell; [`HomeHeroClient`](../../components/marketing/home-hero-client.tsx), [`HomePageBody`](../../components/marketing/home-page-body.tsx) |
| Events list | [`app/events/page.tsx`](../../app/events/page.tsx) — server shell; [`EventsPageClient`](../../components/events/events-page-client.tsx) |
| About | [`app/about/page.tsx`](../../app/about/page.tsx) — server shell; [`AboutPageBody`](../../components/marketing/about-page-body.tsx), [`AboutPageCtaClient`](../../components/marketing/about-page-cta-client.tsx) |
| Search | [`app/search/page.tsx`](../../app/search/page.tsx) — server shell; [`SearchPageClient`](../../components/search/search-page-client.tsx) |
| Site chrome | [`components/ui/header/`](../../components/ui/header/) — `SiteHeader` + `Header` + parts (replaces monolithic `header.tsx`) |

Related backlog: [`refactor-inventory.md`](refactor-inventory.md) (Phase 9 rows marked **Done**).

## Goals

1. **Public pages default to Server Components** — move data needs and layout to the server; push interactivity into named client islands (filters, carousels, search-driven UI) only where browser APIs require it.
2. **Header decomposition** — server parent owns structure and anything that can be resolved on the server (e.g. session-derived links); small client leaves for mobile menu, dropdowns, and client-only navigation affordances.
3. **No oversized shell component** — header splits by responsibility (logo, nav, auth cluster, admin affordances) with clear file boundaries.

## Suggested task order (one PR or sub-phase each)

1. **Header first (highest reuse)** — **Done (April 2026):** [`components/ui/header/`](../../components/ui/header/) — `SiteHeader` (server: session + `is_admin`, server-rendered desktop nav as `children`) + `Header` (client: `useAuth`, user menu, optional `serverSnapshot`). Server routes / shells migrated below still use **`Header`** when the parent is a client component. Migrate remaining marketing pages in steps 2–4.
   - **Uses `SiteHeader` today:** `app/page`, `app/search/page`, `app/events/page`, `app/about/page`, `app/events/[id]/page`, `app/sitemap`, `app/calendar`, `app/faq`, `app/admin/faq`, `AuthPageShell`, `MembershipCancelPageShell`, `app/membership/success/loading`, `app/membership/cancel/page` (async). **`Header` (client-only) still:** shells re-exported under client wrappers (membership marketing/checkout/success client, settings, admin dashboards, etc.).

2. **`app/page.tsx`** — **Done (April 2026):** Server `page.tsx` with `SiteHeader` (`authFromParent` + `loadHomeAuthSnapshot`), `HomeHeroClient` (auth CTAs + admin banner from `searchParams`), `HomePageBody` (static features + CTA). Implementation: [`components/marketing/home-hero-client.tsx`](../../components/marketing/home-hero-client.tsx), [`components/marketing/home-page-body.tsx`](../../components/marketing/home-page-body.tsx), [`lib/marketing/load-home-auth-snapshot.ts`](../../lib/marketing/load-home-auth-snapshot.ts).

3. **`app/events/page.tsx`** — **Done (April 2026):** Server `page.tsx` with `SiteHeader` + `loadHomeAuthSnapshot`, `loadActiveEventsListData` (same query as hook), `EventsPageClient` + `useRealtimeEvents(initial)` for realtime updates.
4. **`app/about/page.tsx`** — **Done (April 2026):** Server `page.tsx` with `SiteHeader` + `loadHomeAuthSnapshot`, static [`AboutPageBody`](../../components/marketing/about-page-body.tsx), [`AboutPageCtaClient`](../../components/marketing/about-page-cta-client.tsx) for session-aware admin CTA (`Event Organizers`).
5. **Inventory refresh** — **Done (April 2026):** `npm run inventory:phase0` → [`refactor-inventory.snapshot.md`](refactor-inventory.snapshot.md); team table + priority gist updated in [`refactor-inventory.md`](refactor-inventory.md).

## Implementation plan (detail)

### What needs to change

| Surface | Today | Direction |
| --- | --- | --- |
| [`app/layout.tsx`](../../app/layout.tsx) | No header; pages render `<Header />` themselves | Optional later: single `SiteHeader` in layout to dedupe (coordinate with all routes that currently self-wrap). |
| [`components/ui/header/`](../../components/ui/header/) | `SiteHeader` + split modules (`parts/*`, `header-user-menu`, `header-client`) | Optional: hoist header into `app/layout.tsx`; migrate remaining client-only pages to server shells in steps 2–4. |
| [`app/page.tsx`](../../app/page.tsx) | Server home + `HomeHeroClient` + `HomePageBody`; `SiteHeader` with `authFromParent` | **Done** (Phase 9 step 2). |
| [`app/events/page.tsx`](../../app/events/page.tsx) | Server shell + [`EventsPageClient`](../../components/events/events-page-client.tsx): [`useRealtimeEvents(initial)`](../../lib/hooks/use-realtime-events.ts), `loadActiveEventsListData` | **Done:** hybrid initial list from server, realtime via Supabase channel; admin empty-state CTA uses `serverSnapshot` + client fallback like home hero. |
| [`app/about/page.tsx`](../../app/about/page.tsx) | Server shell + static [`AboutPageBody`](../../components/marketing/about-page-body.tsx); [`AboutPageCtaClient`](../../components/marketing/about-page-cta-client.tsx) for admin organizer link | **Done:** same `serverSnapshot` + client `is_admin` fallback pattern as home hero / events. |

Repeated pattern to remove: `useEffect` + `createClient()` + `users.is_admin` on home, events, about—replace with one server read or props from a server header shell.

### What can break

* **Session / admin parity** — Server `createClient()` must see the same cookies as the client. If `is_admin` or “logged in” diverges from `useAuth`, admin links and dashboards will flash wrong or disappear.
* **Events realtime** — Initial list vs subscription: wrong merge causes flicker, duplicate keys, or stale first paint. Test tab open + new event appearing.
* **Home `?error=admin-access-required`** — Resolved on the **server** via `searchParams` on [`app/page.tsx`](../../app/page.tsx) (no `useSearchParams` / Suspense needed for that flag).
* **Header import path** — Client code must use `import { Header } from "@/components/ui/header"` only. Server/async shells must use `import { SiteHeader } from "@/components/ui/header/site-header"` so `next/headers` is never bundled into client graphs.

### Quality steps

1. **Manual matrix** — Logged out / normal user / admin: home hero CTAs, header admin link, events banner, about bottom CTA if any. Hit `/?error=admin-access-required` after redirect from admin middleware.
2. **Realtime smoke** — Events page: load list, create or toggle an event elsewhere (or admin), confirm UI updates without full refresh.
3. **Regression** — `npm run typecheck` + `npm run pr` (or lint + typecheck) on each sub-PR.
4. **Incremental PRs** — Per [suggested task order](#suggested-task-order-one-pr-or-sub-phase-each): header → home → events → about → inventory; do not mix membership/Stripe work.

## Risks / what can break

* **Auth and admin detection** — Today home/header use `useAuth` + client Supabase for `is_admin`. Moving checks to the server must use the same session source (`createClient` from `@/lib/supabase/server` or existing auth helpers) so admin links and errors match production.
* **Layout duplication** — Root layout does not mount `Header` today; each page does. Either keep that pattern during migration or move header to layout in a dedicated PR and verify every route.
* **Bundle size** — Client islands should not re-pull the entire page; lazy or narrow imports where helpful.

## Do not mix

* Reworking **membership checkout** or **Stripe** product flows (Phase 6/8 territory) in the same PR as shell refactors.
* Changing **SEO/marketing copy** broadly while refactoring — keep refactors behavior- and content-neutral unless explicitly requested.

## Exit criteria

**Met (April 2026).**

* `app/page.tsx`, `app/events/page.tsx`, and `app/about/page.tsx` are **server-first** (no full-page `"use client"` unless a documented exception).
* **Header** is split into smaller modules with a clear server/client boundary.
* [`refactor-inventory.md`](refactor-inventory.md) reflects updated line counts / phase tags for these paths (see step 5 + team backlog rows).

## Next steps after Phase 9

* Remaining **P1** backlog: queue UI components (`components/queue-list.tsx`, etc.), `app/actions/test-helpers.ts` — unrelated to public shell unless touched for layout.
