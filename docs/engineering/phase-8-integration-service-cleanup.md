# Phase 8 — integration & service cleanup

**Status: complete (April 2026).** Integration surfaces and the queue algorithm module were decomposed per plan; optional follow-up remains (split `lib/stripe/webhooks/handlers.ts` by event family).

Phased plan: [`.cursor/plans/rules.mdc_phased_refactor_c02ab9c1.plan.md`](../../.cursor/plans/rules.mdc_phased_refactor_c02ab9c1.plan.md).  
**Prerequisite:** [Phase 7](phase-7-action-layer-walkthrough.md) complete.  
**Next (optional):** [Phase 9](phase-9-public-marketing-shell.md) — public/marketing shell + header.

## Delivered layout

| Area | Where it lives now |
| --- | --- |
| Stripe webhooks | Thin route [`app/api/webhooks/stripe/route.ts`](../../app/api/webhooks/stripe/route.ts); [`lib/stripe/webhooks/*`](../../lib/stripe/webhooks/) (`dispatch`, `handlers`, `stripe-narrow`, `db-client`). |
| Email | Transport [`lib/email/resend.ts`](../../lib/email/resend.ts); templates [`lib/email/templates/queue-notifications.ts`](../../lib/email/templates/queue-notifications.ts); shared data [`lib/email/queue-email-data.ts`](../../lib/email/queue-email-data.ts). |
| Queue algorithm | Facade [`lib/queue-manager.ts`](../../lib/queue-manager.ts); modules [`lib/queue/algorithm/*`](../../lib/queue/algorithm/). |

## Original targets (from plan)

| Area | Primary paths |
| --- | --- |
| Stripe webhooks | [`app/api/webhooks/stripe/route.ts`](../../app/api/webhooks/stripe/route.ts) |
| Email / Resend | [`lib/email/resend.ts`](../../lib/email/resend.ts) |
| Queue algorithm | [`lib/queue-manager.ts`](../../lib/queue-manager.ts) |

## Goals

1. **Webhooks** — Route stays **dispatch-only** (verify signature, parse event, delegate). Handlers live under something like `lib/stripe/webhooks/` (or `lib/stripe/handlers/`) with typed payloads and idempotency concerns localized.
2. **Email** — Separate **composition** (templates, subject/body assembly, shared `QueueEmailData` shaping) from **transport** (Resend client calls, error mapping). Keep server actions thin; they already call into `lib/email` from Phase 7.
3. **Queue manager** — Split by **algorithmic responsibility** (e.g. next-player selection, combination math, game-completion / assignment prep) so units are easier to scan and test. Align names and call sites with `lib/queue/services` where overlap is obvious; avoid double sources of truth.

## Suggested task order (one PR or sub-phase each)

1. **Stripe extraction (no behavior change)** — Move `handleCheckoutCompleted`, `handleSubscriptionUpdate`, `handlePaymentSucceeded`, `handlePaymentFailed` (and helpers) into `lib/stripe/*`; route imports and invokes by event type; add minimal logging boundary if needed.
2. **Resend split** — Introduce `lib/email/templates/*` or `lib/email/messages/*` for HTML/text builders; keep `resend.ts` focused on “send + message id” and shared retry/error types. Migrate one email family per PR to reduce risk.
3. **Queue-manager carve-out** — Start with the largest / most isolated static methods (`collectExactCombinations`, `getNextPlayers`, `handleGameCompletion`, etc.); move to `lib/queue/algorithm/*` or extend existing helpers; re-export from `queue-manager` temporarily if needed for churn control.
4. **Inventory refresh** — Run `npm run inventory:phase0` and update [`refactor-inventory.md`](refactor-inventory.md) line counts and “Target phase” column.

## Do not mix (per plan)

* Webhook rewrite + queue algorithm rewrite in one PR.
* Changing membership **business rules** while moving Stripe code (keep refactors structural).

## Exit criteria (met)

* Webhook route is **thin** and dispatches to `lib/stripe/webhooks/*`.
* Email **template/composition** is separable from **sending**.
* Queue logic has clear homes under **`lib/queue/algorithm/*`** with a thin **`QueueManager`** facade.

## Follow-up (optional, not blocking)

* Split [`lib/stripe/webhooks/handlers.ts`](../../lib/stripe/webhooks/handlers.ts) by event family if file size becomes painful.

## Next phase pointer

**Phase 9 (optional)** — [`phase-9-public-marketing-shell.md`](phase-9-public-marketing-shell.md) — public/marketing shell + header decomposition.
