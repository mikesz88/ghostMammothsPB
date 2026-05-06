# Phase 1 — RSC conventions & component targets

**Status:** Active. Phase 0 (inventory) is complete; **Phase 2** (`app/events/[id]`) member event detail is **done**; route-by-route migration continues with **Phase 3** (admin event console) and later phases. Phase 1 **does not** require rewriting existing pages—only **conventions** and **where new code goes**.

## Route pattern (new or touched `app/**/page.tsx`)

1. **`page.tsx`** stays a **Server Component** by default (no file-level `"use client"` unless explicitly documented and unavoidable).
2. **Initial data** is loaded on the **server** (RSC, `fetch`, server helpers, or server actions invoked from server context)—not from client `useEffect` for first paint.
3. **Interactivity** (state, effects, browser APIs, Supabase Realtime in browser) lives in **small client leaf** components under the domain folders below.
4. **Server actions** stay **thin**: validate input → call `lib/` (or future services) → return; avoid fat handlers in `app/actions/*` when touching them.
5. **Hooks** (`use*`): colocate with client leaves or under `hooks/` for reuse; **no** server-only imports in hooks or presentational components (see ESLint).

## Domain component folders

Place **new** interactive UI here so Phase 2–6 extractions have a clear home. Legacy components may still live under `components/` root until a phase moves them.

| Folder | Use for | Typical plan phase |
| --- | --- | --- |
| [`components/events/`](../../components/events/) | Member/public event experience (queue, dialogs, live UI tied to an event) | 2, 4 |
| [`components/admin/events/`](../../components/admin/events/) | Admin event console, controls, test-only UI | 3, 4 |
| [`components/settings/`](../../components/settings/) | Settings pages’ client islands | 6 |
| [`components/auth/`](../../components/auth/) | Login, signup, password flows (client leaves) | 6 |
| [`components/membership/`](../../components/membership/) | Membership, checkout, tier UI | 6 |

Shared primitives stay in **`components/ui/`** (buttons, inputs, layout shells).

## What “touched” means

If a PR edits a route or adds a feature on a page: **apply this pattern to that change**—extract new interactivity into the right domain folder; avoid growing a client `page.tsx` further without a planned migration PR.

## What Phase 1 is not

* **No** wholesale move of existing files from `components/*` into domain folders (do that in the relevant **phase PR** to keep review small).
* **No** Phase 2/3 behavior changes (queue algorithm, admin event semantics)—those are later phases.
* **No** relaxing ESLint or `tsconfig` to silence warnings; see [`LINT_POLICY_LOCK.md`](LINT_POLICY_LOCK.md) and [`script/tooling-policy-guard.mjs`](../../script/tooling-policy-guard.mjs).

## References

* Phased plan: [`.cursor/plans/rules.mdc_phased_refactor_c02ab9c1.plan.md`](../../.cursor/plans/rules.mdc_phased_refactor_c02ab9c1.plan.md) (Phase 1 § + Phase 2 onward).
* Backlog & priorities: [`refactor-inventory.md`](refactor-inventory.md).
* Project rules: [`.cursor/rules.mdc`](../../.cursor/rules.mdc).
