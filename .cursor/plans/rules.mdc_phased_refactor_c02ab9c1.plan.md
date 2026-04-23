---
name: rules.mdc phased refactor
overview: "Refined phased migration: baseline inventory (Phase 0), RSC guardrails (Phase 1), route-by-route server-first composition (Phases 2–6), shared extraction (Phase 4), action/service splits (Phases 7–8), optional public shell (Phase 9). Aligns with [.cursor/rules.mdc](.cursor/rules.mdc); behavior-neutral unless a phase explicitly allows change."
todos:
  - id: phase-0
    content: "Phase 0: Baseline inventory, tag files by refactor type, warn-level ESLint + architecture audit, no new page-level use client"
    status: completed
  - id: phase-1
    content: "Phase 1: Conventions + RSC guardrails, import order, target folders (events/admin/settings/auth/membership)"
    status: completed
  - id: phase-2
    content: "Phase 2: Member event detail app/events/[id] — server page, client islands, no Supabase in page.tsx"
    status: completed
  - id: phase-3
    content: "Phase 3: Admin event console + test-controls — server shell, isolated controls, no broad queue.ts split"
    status: completed
  - id: phase-4
    content: "Phase 4: Shared event/admin extraction — loaders, mappers, domain UI, stable types"
    status: pending
  - id: phase-5
    content: "Phase 5: Admin dashboard + users + email-stats — server reads, small client widgets"
    status: pending
  - id: phase-6
    content: "Phase 6: Settings, membership, auth — server-first, form client children"
    status: pending
  - id: phase-7
    content: "Phase 7: Action layer split — queue, notifications; re-exports; behavior unchanged"
    status: pending
  - id: phase-8
    content: "Phase 8: Stripe webhook thin route, email/resend, queue-manager cleanup"
    status: pending
  - id: phase-9
    content: "Phase 9 (optional): Public/marketing shell + header decomposition"
    status: pending
  - id: phase-0-lint-ci
    content: "Optional hygiene: ESLint error burn-down, ignores for generated paths, CI/PR policy — see Lint appendix"
    status: pending
isProject: false
---

# Phased Refactor Plan — Refined

## Global Migration Rules

These rules apply to every phase.

### Route migration rules

* `page.tsx` must become a Server Component by default
* No file-level `"use client"` in `page.tsx` unless explicitly documented as unavoidable
* Initial data fetch belongs on the server
* Client Components are allowed only for interactivity, browser-only APIs, or Realtime subscriptions
* Client logic must be isolated into small leaf components

### Scope control rules

* Do not change product behavior unless the phase explicitly allows it
* Do not rewrite shared algorithms while converting route structure
* Do not split domain services and refactor route UI in the same PR unless the extraction is tiny and local
* Do not normalize the whole repo while migrating one route

### Legacy tolerance rules

* Existing messy structure may remain outside the touched area
* New logic must follow the target architecture
* Touched code should be improved when reasonably adjacent
* Do not make legacy files worse just because they are already messy

### Done definition for any route phase

A route phase is only complete when:

* `page.tsx` is server-first
* initial reads happen on the server
* client-only logic is extracted into leaf components
* no direct Supabase reads remain in the page file
* data flow is clear: server page → props → client island → action/hook
* the route still works end-to-end

---

## Phase 0 — Baseline Inventory & Safety Rails

### Goal

Create a stable starting point before touching architecture.

### Tasks

* Inventory the top oversized files by route, component, action, and lib
* Tag files by refactor type:

  * server-page migration
  * client-island extraction
  * form extraction
  * action split
  * service split
  * shared UI split
* Add warn-level ESLint and architecture audit only
* Define “no new page-level `use client`” rule for new or touched routes

### Deliverables

* prioritized file list
* category label for each large file
* agreed migration rules for route work

### Exit criteria

* team has a clear refactor map
* lint/audit warnings exist but do not block
* no new route pages are added as full client pages

---

## Phase 1 — Conventions + RSC Guardrails

### Goal

Freeze bad patterns before route-by-route work begins.

### Tasks

* Enforce server-first `page.tsx` policy for all new/touched routes
* Establish route pattern:

  * server page
  * server data loader/action
  * leaf client components
  * client hooks only inside client leaves
* Standardize import order and warn-level file-size/complexity checks
* Define folder targets for extracted UI:

  * `components/events/`
  * `components/admin/events/`
  * `components/settings/`
  * `components/auth/`
  * `components/membership/`

### Deliverables

* migration conventions in active use
* no new full-client route pages
* agreed target folders for extracted components

### Exit criteria

* every new/touched route follows server-first convention
* lint rules and audit script are active
* no architectural ambiguity for future phases

### Implementation (repo)

* Conventions doc: [`docs/engineering/phase-1-rsc-conventions.md`](../../docs/engineering/phase-1-rsc-conventions.md)
* Domain folders (scaffold): `components/events/`, `components/admin/events/`, `components/settings/`, `components/auth/`, `components/membership/`
* `.cursor/rules.mdc` — Phase 1 domain targets under **Next.js Structure → Routes**

---

## Phase 2 — Member Event Detail Route

### Status

**Completed (April 2026).** Server composition in `app/events/[id]/page.tsx`, client island under `components/events/`, loaders in `lib/events/`. Walkthrough: [`docs/engineering/phase-2-event-detail-walkthrough.md`](../../docs/engineering/phase-2-event-detail-walkthrough.md). Membership reads for this route use `canUserJoinEvent` / `getUserMembership` with an optional server Supabase client; `getUserMembership` lives under `lib/membership/`.

### Target

* `app/events/[id]/page.tsx`

### Goal

Convert the public/member event detail page to server-first composition.

### Tasks

* Move initial event, court, assignment, and membership reads to the server
* Keep `page.tsx` as server-only composition
* Extract Realtime queue logic into a dedicated client leaf, for example:

  * `components/events/event-queue-live.tsx`
* Extract dialogs and actions into small client components, for example:

  * `event-qr-dialog.tsx`
  * `event-actions-card.tsx`
  * `event-payment-cta.tsx`
* Keep hooks like `useRealtimeQueue` inside client leaves only
* Ensure no direct Supabase client reads remain in `page.tsx`

### Do not do in this phase

* do not redesign queue behavior
* do not split queue algorithm internals
* do not refactor unrelated event list pages

### Exit criteria

* `page.tsx` has no `"use client"`
* initial reads are server-side
* client islands are isolated and named clearly
* page file becomes a composition layer, not a mega component
* event flow smoke test passes

### Implementation guide (repo)

* Line-by-line walkthrough and suggested slices: [`docs/engineering/phase-2-event-detail-walkthrough.md`](../../docs/engineering/phase-2-event-detail-walkthrough.md)

---

## Phase 3 — Admin Event Console

**Status: complete (April 2026).** See [`docs/engineering/phase-3-admin-event-walkthrough.md`](../../docs/engineering/phase-3-admin-event-walkthrough.md).

### Targets

* `app/admin/events/[id]/page.tsx`
* related `test-controls.tsx`

### Goal

Apply the same server-shell + client-island model to the most complex admin route.

### Tasks

* Move initial event, queue snapshot, and assignments read to the server
* Keep auth checks server-side
* Split interactive regions into focused client components:

  * queue panel
  * court controls
  * assignment history
  * dialogs
  * test controls
* Introduce shared serializable prop shaping if needed
* Move page-level reads out of client code
* Reduce the route file into server composition

### Do not do in this phase

* do not split `app/actions/queue.ts` broadly yet
* do not change queue assignment logic
* do not rewrite admin dashboard pages

### Exit criteria

* admin event page is server-first
* page-level `use client` removed
* interactive controls isolated
* queue/admin behavior unchanged
* admin event smoke test passes

---

## Phase 4 — Shared Event/Admin Extraction Pass

### Goal

Stabilize shared patterns before expanding to more routes.

### Tasks

* Extract shared server loaders/helpers used by both event and admin event routes
* Extract shared prop mappers / serializers if duplicated
* Extract repeated cards/panels/dialog structures into domain folders
* Normalize shared event/admin types into stable locations

### Deliverables

* shared route helpers for event/admin domain
* less duplicated server-fetch and mapping logic
* cleaner base for later admin/settings migrations

### Exit criteria

* repeated event/admin patterns are centralized
* route-level duplication is reduced
* later phases can reuse stable patterns instead of copying

---

## Phase 5 — Admin Dashboard + User/Roster Routes

### Targets

* `app/admin/page.tsx`
* `app/admin/users/page.tsx`
* `app/admin/users/[id]/page.tsx`
* `app/admin/email-stats/page.tsx`

### Goal

Convert admin data pages to server-rendered reads with small interactive widgets.

### Tasks

* Move initial reads server-side
* Keep tables/stats server-rendered by default
* Extract only interactive parts into client widgets:

  * search-as-you-type
  * row actions
  * modals
  * optimistic updates
* Route Supabase reads through server actions/loaders
* Avoid page-level client fetching

### Do not do in this phase

* do not deeply refactor queue/actions
* do not mix membership/auth flow migration here

### Exit criteria

* admin pages render initial data on server
* client logic is limited to real interactivity
* page files are clearly structured and smaller

---

## Phase 6 — Settings, Membership, and Auth Routes

### Targets

* `app/settings/page.tsx`
* `app/settings/membership/page.tsx`
* `app/settings/notifications/page.tsx`
* `app/membership/page.tsx`
* `app/membership/checkout/page.tsx`
* `app/membership/success/page.tsx`
* `app/login/page.tsx`
* `app/signup/page.tsx`
* `app/reset-password/page.tsx`

### Goal

Move session/membership reads server-side while keeping forms as focused client children.

### Tasks

* Keep route pages server-first
* Pass initial session, membership, and profile state in via props
* Extract form shells and interactive controls to:

  * `components/settings/`
  * `components/membership/`
  * `components/auth/`
* Keep browser-only auth integrations inside small client boundaries
* Avoid `useEffect + createClient()` in page files

### Do not do in this phase

* do not mix billing webhook rewrites here
* do not redesign auth flows unless required by route migration

### Exit criteria

* auth/settings/membership pages are server-first where possible
* forms are isolated client components
* page files stop owning both fetch + state + JSX + provider logic

---

## Phase 7 — Action Layer Split

### Targets

* `app/actions/queue.ts`
* `app/actions/notifications.ts`
* related server-only action files

### Goal

Split large action files by responsibility after route boundaries are already stable.

### Tasks

* split queue reads vs mutations
* split court assignment concerns
* split notifications by domain
* add temporary re-export entrypoints if needed to avoid churn
* keep behavior unchanged

### Do not do in this phase

* do not change queue algorithm behavior
* do not simultaneously refactor admin event UI unless the dependency is tiny

### Exit criteria

* action files are responsibility-based
* route code imports clearer entrypoints
* behavior is unchanged

---

## Phase 8 — Integration & Service Cleanup

### Targets

* `app/api/webhooks/stripe/route.ts`
* `lib/email/resend.ts`
* `lib/queue-manager.ts`

### Goal

Thin the route handlers and split oversized service/integration modules.

### Tasks

* move Stripe webhook handlers behind `lib/stripe/*`
* keep webhook route thin and dispatch-only
* split email templates / email composition from sending
* split queue manager by algorithmic responsibility if still oversized

### Exit criteria

* webhook routes are thin
* email/template logic is separated
* queue-manager is easier to scan and test

---

## Phase 9 — Public/Marketing Shell Cleanup (Optional)

### Targets

* `app/page.tsx`
* `app/events/page.tsx`
* `app/about/page.tsx`
* `components/ui/header.tsx`

### Goal

Apply server-first shell patterns to public pages and split oversized layout/UI pieces.

### Tasks

* keep public pages server-rendered by default
* extract client-only filters/carousels if needed
* split header into:

  * server parent for user/role/session-driven structure
  * small client pieces for mobile menu/dropdowns only

### Exit criteria

* public pages remain server-first
* header is decomposed by responsibility
* no oversized UI shell component remains

---

## PR Rules Per Phase

Each PR must include:

* what changed
* what did not change
* where logic now lives
* data flow summary:

  * server page
  * props
  * client islands
  * server actions/loaders
* explicit list of remaining follow-up debt that was intentionally left out

Prefer one phase or one subphase per PR.

---

## Recommended Execution Order

1. Phase 0 — Baseline Inventory & Safety Rails
2. Phase 1 — Conventions + RSC Guardrails
3. Phase 2 — Member Event Detail
4. Phase 3 — Admin Event Console
5. Phase 4 — Shared Event/Admin Extraction
6. Phase 5 — Admin Dashboard + User/Roster
7. Phase 6 — Settings, Membership, Auth
8. Phase 7 — Action Layer Split
9. Phase 8 — Integration & Service Cleanup
10. Phase 9 — Public/Marketing Shell Cleanup

---

## Lint, PR gate, and CI during migration

Architectural phases shrink **max-lines**, **complexity**, and **client sprawl** over time. They do **not** automatically clear hundreds of ESLint findings in one step. Treat lint cleanup as **parallel hygiene** unless a phase explicitly tightens rules.

### Errors vs warnings

* ESLint **exits non-zero on errors**. Fix error-level rules (for example `unused-imports`, `@typescript-eslint/no-unused-vars`) before `npm run lint`, `npm run build`, or `npm run ci` can pass end-to-end.
* **Warnings** do not fail the run unless you add `--max-warnings 0` (or equivalent). You can “endure” warning noise while fixing errors first.

### After Phase 0 — progressively stronger lint

Phase 0 is intentionally **warning-first** so the map and refactors can proceed without blocking on every `max-lines` / `complexity` finding. **As each phase (or hygiene PR) lands**, the team should **promote selected rules from `warn` to `error`**, add **stricter rules** where the codebase is ready, and optionally adopt **`--max-warnings 0`** on the `lint` script once a baseline burn-down makes that realistic. Do this in **small steps** (one rule family or one folder at a time) so CI stays tractable.

### What `npm run ci` does today

* `ci` runs: `lint` → `build` → `test:a11y`.
* `build` is defined as `npm run lint && next build`, so **lint runs twice** in a full `ci` (redundant but harmless). **Both** steps must succeed for `ci` to finish.

### Verifying build and a11y without going through `npm run` lint wrappers

If lint is still failing but you want a **local** signal on compile and Playwright a11y:

* Run **`npx next build`** (invokes `next build` directly, skipping the `build` script’s lint preamble).
* Then **`npm run test:a11y`**.

CI should still aim for a clean `npm run lint` before merge; this is for **local** debugging only unless you add a dedicated script (for example `ci:no-lint`) and agree on when it is allowed.

### PR gate (`npm run pr`)

* [`script/pr-gate.mjs`](script/pr-gate.mjs) runs **`npm run lint`** and **`npm run typecheck`** (blocking), then **`npm run architecture:audit`** (reporting).
* **`typecheck`** is **`tsc`** against [`tsconfig.json`](tsconfig.json). Generated `.next/dev` type stubs are not included so a plain `tsc` run stays stable.

### Practical hygiene (optional micro-PRs)

* **`eslint --fix`** on touched paths; auto-fix **import/order** where safe.
* **Overrides** for generated or vendored paths (for example Supabase schema dumps) so editors do not fight machine output.
* **`no-console`**: allow or strip in `script/` / one-off tooling via overrides if the team agrees.
* **`--max-warnings`**: adopt only after a baseline burn-down so CI stays green.

---

## High-Risk Do-Not-Mix Rules

Do not combine these in one PR:

* route architecture migration + queue algorithm rewrite
* admin event route refactor + broad `queue.ts` split
* membership/auth route migration + Stripe webhook restructuring
* public shell cleanup + admin domain extraction

Keep structural refactors isolated so regressions are easier to find.
