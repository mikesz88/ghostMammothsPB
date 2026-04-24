import type Stripe from "stripe";

/**
 * Stripe SDK types for API 2025+ omit legacy period fields on `Subscription` in some builds,
 * but the REST API still returns unix timestamps for billing periods.
 */
export type SubscriptionWithBillingPeriods = Stripe.Subscription & {
  current_period_start: number;
  current_period_end: number;
};

export function asSubscriptionWithBillingPeriods(
  sub: Stripe.Subscription,
): SubscriptionWithBillingPeriods {
  return sub as SubscriptionWithBillingPeriods;
}
