# Phase 7 — action layer split (queue + notifications)

**Status: complete (April 2026).** Queue and notification **server actions** are thin: orchestration, `revalidatePath`, and dependency wiring stay in `app/actions/`; domain logic lives under `lib/queue/**` and focused action modules. Stable import path `@/app/actions/notifications` is preserved via **async wrapper exports** (Next.js `"use server"` files cannot barrel-re-export functions).

Phased plan: [`.cursor/plans/rules.mdc_phased_refactor_c02ab9c1.plan.md`](../../.cursor/plans/rules.mdc_phased_refactor_c02ab9c1.plan.md).

## Actions (delivered)

| File | Role |
| --- | --- |
| [`app/actions/queue.ts`](../../app/actions/queue.ts) | `getQueue`, join/leave/reorder/end/assign/admin-remove; delegates to `lib/queue/services/*`; passes `flushQueueEmailNotifications` into membership and queue maintenance. |
| [`app/actions/notifications.ts`](../../app/actions/notifications.ts) | Async wrappers: `sendQueueNotification`, `flushQueueEmailNotifications`, `getEmailStats`, `resendQueueEmailFromLog`; type re-exports only. |
| [`app/actions/queue-email-notifications.ts`](../../app/actions/queue-email-notifications.ts) | Queue email send, routing, logging, batched flush. |
| [`app/actions/admin-email-stats-actions.ts`](../../app/actions/admin-email-stats-actions.ts) | Admin email stats fetch + resend-from-log helpers. |

## Queue services (delivered)

Core split under [`lib/queue/services/`](../../lib/queue/services/): membership (`queue-membership-*.ts`), court assignment (`court-assignment*.ts`, `load-staying-mapped-for-court.ts`), end-game (`end-game*.ts`), `queue-ordering.ts`, `maintenance.ts`. Supporting modules: [`lib/queue/pending-solo.ts`](../../lib/queue/pending-solo.ts), [`pending-solo-combinations.ts`](../../lib/queue/pending-solo-combinations.ts), [`pending-stayers.ts`](../../lib/queue/pending-stayers.ts), [`assignment-helpers.ts`](../../lib/queue/assignment-helpers.ts), [`mappers.ts`](../../lib/queue/mappers.ts).

[`lib/queue-manager.ts`](../../lib/queue-manager.ts) was left to **Phase 8**; it is now a thin facade over [`lib/queue/algorithm/*`](../../lib/queue/algorithm/).

## Exit criteria (checked)

* Action files are **responsibility-based** (queue vs queue-email vs admin email stats vs notifications barrel).
* Call sites keep **clear entrypoints** (`@/app/actions/queue`, `@/app/actions/notifications`).
* **Behavior** preserved (no intentional algorithm or product rule changes).

## Follow-up debt (intentional)

* **Phase 8 (complete):** Stripe webhooks, email transport/templates, queue algorithm modules — [`phase-8-integration-service-cleanup.md`](phase-8-integration-service-cleanup.md).
* **Phase 9 (optional):** public/marketing shell + header — [`phase-9-public-marketing-shell.md`](phase-9-public-marketing-shell.md).
* Hygiene: repo-wide ESLint warning burn-down is parallel to phases (see plan appendix).

## Next phase pointer

**Phase 9 (optional)** — public/marketing shell — tracking doc: [`phase-9-public-marketing-shell.md`](phase-9-public-marketing-shell.md).
