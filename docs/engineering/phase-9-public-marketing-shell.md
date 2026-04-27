# Phase 9 — public / marketing shell (optional)

**Status: not started (April 2026).** Server-first cleanup for **marketing-facing** routes and the shared **site header**. Aligns with [`.cursor/plans/rules.mdc_phased_refactor_c02ab9c1.plan.md`](../../.cursor/plans/rules.mdc_phased_refactor_c02ab9c1.plan.md) § Phase 9.

**Prerequisite:** [Phase 8](phase-8-integration-service-cleanup.md) complete.

## Targets (current hotspots)

| Area | Primary paths |
| --- | --- |
| Home | [`app/page.tsx`](../../app/page.tsx) — full `"use client"` page (~200+ lines) |
| Events list | [`app/events/page.tsx`](../../app/events/page.tsx) — client page |
| About | [`app/about/page.tsx`](../../app/about/page.tsx) — client page |
| Site chrome | [`components/ui/header.tsx`](../../components/ui/header.tsx) — very large client component |

Related backlog rows: [`refactor-inventory.md`](refactor-inventory.md) (`app/page.tsx`, `app/events/page.tsx`, `app/about/page.tsx`, `components/ui/header.tsx`).

## Goals

1. **Public pages default to Server Components** — move data needs and layout to the server; push interactivity into named client islands (filters, carousels, search-driven UI) only where browser APIs require it.
2. **Header decomposition** — server parent owns structure and anything that can be resolved on the server (e.g. session-derived links); small client leaves for mobile menu, dropdowns, and client-only navigation affordances.
3. **No oversized shell component** — header splits by responsibility (logo, nav, auth cluster, admin affordances) with clear file boundaries.

## Suggested task order (one PR or sub-phase each)

1. **Header first (highest reuse)** — Introduce a server wrapper (e.g. `components/layout/site-header.tsx` or under `components/marketing/`) that composes existing pieces; extract `HeaderLogo`, nav links, and user menu into colocated modules; minimize duplicate Supabase/admin checks if a server loader can supply `isAdmin` / `user` snapshot as props.
2. **`app/page.tsx`** — Replace root client page with a server `page.tsx` + `HomePageClient` (or smaller islands) for only `useSearchParams`, auth-dependent CTAs, and admin flash behavior.
3. **`app/events/page.tsx`** — Same pattern: server list shell + client filter/sort island if needed.
4. **`app/about/page.tsx`** — Often easiest win: mostly static content → server page + tiny client bits if any.
5. **Inventory refresh** — `npm run inventory:phase0`; update [`refactor-inventory.md`](refactor-inventory.md) for the touched paths.

## Risks / what can break

* **Auth and admin detection** — Today home/header use `useAuth` + client Supabase for `is_admin`. Moving checks to the server must use the same session source (`createClient` from `@/lib/supabase/server` or existing auth helpers) so admin links and errors match production.
* **Layout duplication** — Ensure `Header` remains a single import path for `app/layout.tsx` (or document the new entry).
* **Bundle size** — Client islands should not re-pull the entire page; lazy or narrow imports where helpful.

## Do not mix

* Reworking **membership checkout** or **Stripe** product flows (Phase 6/8 territory) in the same PR as shell refactors.
* Changing **SEO/marketing copy** broadly while refactoring — keep refactors behavior- and content-neutral unless explicitly requested.

## Exit criteria

* `app/page.tsx`, `app/events/page.tsx`, and `app/about/page.tsx` are **server-first** (no full-page `"use client"` unless a documented exception).
* **Header** is split into smaller modules with a clear server/client boundary.
* [`refactor-inventory.md`](refactor-inventory.md) reflects updated line counts / phase tags for these paths.

## Next steps after Phase 9

* Remaining **P1** backlog: queue UI components (`components/queue-list.tsx`, etc.), `app/actions/test-helpers.ts` — unrelated to public shell unless touched for layout.
