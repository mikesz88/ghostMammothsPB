import type Stripe from "stripe";

/** Fields used by webhooks; Stripe’s generated `Invoice` type may omit some for newer API versions. */
export type StripeInvoiceLike = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
  payment_intent?: string | Stripe.PaymentIntent | null;
  subscription_details?: {
    metadata?: Record<string, string | undefined>;
  } | null;
};

export function invoiceSubscriptionId(
  invoice: Stripe.Invoice,
): string | undefined {
  const sub = (invoice as StripeInvoiceLike).subscription;
  if (typeof sub === "string") return sub;
  if (sub && typeof sub === "object" && "id" in sub) return sub.id;
  return undefined;
}

export function invoicePaymentIntentId(
  invoice: Stripe.Invoice,
): string | undefined {
  const pi = (invoice as StripeInvoiceLike).payment_intent;
  if (typeof pi === "string") return pi;
  if (pi && typeof pi === "object" && "id" in pi) return pi.id;
  return undefined;
}

/** Stripe invoice metadata location varies by API version; narrow without `any`. */
export function invoiceMetadataUserId(invoice: Stripe.Invoice): string | undefined {
  const details = (invoice as StripeInvoiceLike).subscription_details;
  const id = details?.metadata?.user_id;
  return typeof id === "string" ? id : undefined;
}

export function checkoutSessionSubscriptionId(
  sub: Stripe.Checkout.Session["subscription"],
): string | null {
  if (sub == null) return null;
  if (typeof sub === "string") return sub;
  return sub.id;
}
