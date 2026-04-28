import Stripe from "stripe";

import { asSubscriptionWithBillingPeriods } from "@/lib/stripe/subscription-billing";
import {
  checkoutSessionSubscriptionId,
  invoiceMetadataUserId,
  invoicePaymentIntentId,
  invoiceSubscriptionId,
} from "@/lib/stripe/webhooks/stripe-narrow";

import type { DbClient } from "@/lib/stripe/webhooks/db-client";

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: DbClient,
) {
  const userId = session.metadata?.user_id;
  const tierId = session.metadata?.tier_id;

  if (!userId || !tierId) {
    console.error("Missing metadata in checkout session:", session.id);
    return;
  }

  console.warn(`Checkout completed for user ${userId}, tier ${tierId}`);

  const { data: tier, error: tierError } = await supabase
    .from("membership_tiers")
    .select("id, name, display_name, price")
    .eq("id", tierId)
    .single();

  if (tierError || !tier) {
    console.error(`Tier ${tierId} not found in database:`, tierError);
    return;
  }

  console.warn(`Found tier for checkout:`, {
    id: tier.id,
    name: tier.name,
    displayName: tier.display_name,
    price: tier.price,
  });

  const { error: membershipError } = await supabase
    .from("user_memberships")
    .upsert(
      {
        user_id: userId,
        tier_id: tierId,
        status: "active",
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

  if (membershipError) {
    console.error("Error upserting membership:", membershipError);
  }

  await supabase
    .from("users")
    .update({
      membership_status: tier.name,
      stripe_customer_id: session.customer as string,
    })
    .eq("id", userId);

  if (session.amount_total && session.payment_intent) {
    await supabase.from("payments").insert({
      user_id: userId,
      amount: session.amount_total / 100,
      currency: session.currency?.toUpperCase() || "USD",
      payment_type: "membership",
      stripe_payment_intent_id: session.payment_intent as string,
      status: "succeeded",
      description: `${tier.display_name} - Initial subscription payment`,
      metadata: {
        checkout_session_id: session.id,
        subscription_id: checkoutSessionSubscriptionId(session.subscription),
        tier_id: tierId,
        tier_name: tier.name,
      },
    });

    console.warn(
      `Payment recorded for user ${userId}: $${session.amount_total / 100}`,
    );
  }

  console.warn(`User ${userId} upgraded to ${tier.name}`);
}

export async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  supabase: DbClient,
) {
  const userId = subscription.metadata?.user_id;
  const tierId = subscription.metadata?.tier_id;

  if (!userId) {
    console.error("No user_id in subscription metadata");
    return;
  }

  if (!tierId) {
    console.error("No tier_id in subscription metadata");
    return;
  }

  const { data: tier } = await supabase
    .from("membership_tiers")
    .select("id, name")
    .eq("id", tierId)
    .single();

  if (!tier) {
    console.error(`Tier ${tierId} not found in database`);
    return;
  }

  const sub = asSubscriptionWithBillingPeriods(subscription);

  const { error } = await supabase.from("user_memberships").upsert(
    {
      user_id: userId,
      tier_id: tierId,
      status: subscription.status,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      current_period_start: new Date(
        sub.current_period_start * 1000,
      ).toISOString(),
      current_period_end: new Date(
        sub.current_period_end * 1000,
      ).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    console.error("Error upserting membership:", error);
    return;
  }

  await supabase
    .from("users")
    .update({
      membership_status: tier.name,
      stripe_customer_id: subscription.customer as string,
    })
    .eq("id", userId);

  console.warn(
    `Subscription ${subscription.status} for user ${userId} - Tier: ${tier.name} (${tierId})`,
  );
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: DbClient,
) {
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    console.error("No user_id in subscription metadata");
    return;
  }

  await supabase
    .from("user_memberships")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  await supabase
    .from("users")
    .update({ membership_status: "cancelled" })
    .eq("id", userId);

  console.warn(`Subscription cancelled for user ${userId}`);
}

export async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: DbClient,
) {
  const subscription = invoiceSubscriptionId(invoice);
  const userId = invoiceMetadataUserId(invoice);

  if (!userId) {
    console.error("No user_id in invoice metadata");
    return;
  }

  const { data: membership } = await supabase
    .from("user_memberships")
    .select("tier:membership_tiers(name, display_name)")
    .eq("user_id", userId)
    .single();

  const tierName = membership?.tier?.display_name || "Membership";

  await supabase.from("payments").insert({
    user_id: userId,
    amount: (invoice.amount_paid || 0) / 100,
    currency: invoice.currency.toUpperCase(),
    payment_type: "membership",
    stripe_payment_intent_id: invoicePaymentIntentId(invoice) ?? null,
    status: "succeeded",
    description: `${tierName} payment`,
    metadata: {
      invoice_id: invoice.id,
      subscription_id: subscription,
    },
  });

  console.warn(
    `Payment succeeded for user ${userId}: $${(invoice.amount_paid || 0) / 100}`,
  );
}

export async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: DbClient,
) {
  const userId = invoiceMetadataUserId(invoice);

  if (!userId) {
    console.error("No user_id in invoice metadata");
    return;
  }

  const { data: membership } = await supabase
    .from("user_memberships")
    .select("tier:membership_tiers(name, display_name)")
    .eq("user_id", userId)
    .single();

  const tierName = membership?.tier?.display_name || "Membership";

  await supabase
    .from("user_memberships")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  await supabase
    .from("users")
    .update({ membership_status: "past_due" })
    .eq("id", userId);

  await supabase.from("payments").insert({
    user_id: userId,
    amount: (invoice.amount_due || 0) / 100,
    currency: invoice.currency.toUpperCase(),
    payment_type: "membership",
    status: "failed",
    description: `Failed ${tierName} payment`,
    metadata: {
      invoice_id: invoice.id,
      subscription_id: invoiceSubscriptionId(invoice),
    },
  });

  console.error(`Payment failed for user ${userId}`);
}
