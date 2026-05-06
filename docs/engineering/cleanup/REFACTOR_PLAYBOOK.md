# Refactor playbook (safe extraction)

## When to refactor

- You touched a file and the change becomes materially harder because of structure
- ESLint signals: complexity, max-lines, max-params (especially in actions)
- Architecture rule violations in the modified area (business logic in UI, thick server actions)

## The default safe sequence

1. **Identify a seam** — a pure function, a coherent subdomain, or repeated block.
2. **Extract without behavior change**
   - Move code to `lib/...` (or `server/services/...` if you adopt that convention)
   - Keep public signatures stable for the first PR
3. **Add tests where cheap and high value** — prefer tests for pure logic extracted from actions
4. **Follow-up PR** (optional) — rename for clarity once stable

## Next.js specific guidance

- `page.tsx` stays a Server Component by default.
- If interactivity is needed: create a small leaf client component (“island”).

## TypeScript guidance

- Prefer `unknown` + narrowing over `any`
- If you must use `any`, treat it as a defect with a ticket (temporary)

## PR requirements (refactor)

- Label or title prefix: **Refactor (behavior-preserving)** unless explicitly otherwise
- Document:
  - What behavior is preserved
  - What was moved and why
  - How you verified (manual steps and/or tests)

## Verification checklist (minimum)

- `npm run pr`
- Exercise the impacted user flow locally (write the exact clicks/steps in the PR)

## Rollback mindset

- Keep commits clean enough to revert a single extraction PR if needed
