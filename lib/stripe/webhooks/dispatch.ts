import Stripe from "stripe";

import {
  handleCheckoutCompleted,
  handlePaymentFailed,
  handlePaymentSucceeded,
  handleSubscriptionDeleted,
  handleSubscriptionUpdate,
} from "@/lib/stripe/webhooks/handlers";

import type { DbClient } from "@/lib/stripe/webhooks/db-client";

/**
 * Runs side effects for a verified Stripe webhook event. Keep the HTTP route
 * limited to verification + this dispatch.
 */
export async function dispatchStripeWebhookEvent(
  event: Stripe.Event,
  supabase: DbClient,
): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
        supabase,
      );
      return;

    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionUpdate(
        event.data.object as Stripe.Subscription,
        supabase,
      );
      return;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription,
        supabase,
      );
      return;

    case "invoice.payment_succeeded":
      await handlePaymentSucceeded(
        event.data.object as Stripe.Invoice,
        supabase,
      );
      return;

    case "invoice.payment_failed":
      await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase);
      return;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}
