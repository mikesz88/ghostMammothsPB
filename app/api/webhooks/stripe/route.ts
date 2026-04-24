import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe/server";
import { asSubscriptionWithBillingPeriods } from "@/lib/stripe/subscription-billing";
import { createClient } from "@/lib/supabase/server";

import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

type DbClient = SupabaseClient<Database>;

/** Fields used by webhooks; Stripe’s generated `Invoice` type may omit some for newer API versions. */
type StripeInvoiceLike = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
  payment_intent?: string | Stripe.PaymentIntent | null;
  subscription_details?: {
    metadata?: Record<string, string | undefined>;
  } | null;
};

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | undefined {
  const sub = (invoice as StripeInvoiceLike).subscription;
  if (typeof sub === "string") return sub;
  if (sub && typeof sub === "object" && "id" in sub) return sub.id;
  return undefined;
}

function invoicePaymentIntentId(invoice: Stripe.Invoice): string | undefined {
  const pi = (invoice as StripeInvoiceLike).payment_intent;
  if (typeof pi === "string") return pi;
  if (pi && typeof pi === "object" && "id" in pi) return pi.id;
  return undefined;
}

/** Stripe invoice metadata location varies by API version; narrow without `any`. */
function invoiceMetadataUserId(invoice: Stripe.Invoice): string | undefined {
  const details = (invoice as StripeInvoiceLike).subscription_details;
  const id = details?.metadata?.user_id;
  return typeof id === "string" ? id : undefined;
}

function checkoutSessionSubscriptionId(
  sub: Stripe.Checkout.Session["subscription"],
): string | null {
  if (sub == null) return null;
  if (typeof sub === "string") return sub;
  return sub.id;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
          supabase
        );
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(
          event.data.object as Stripe.Subscription,
          supabase
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
          supabase
        );
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(
          event.data.object as Stripe.Invoice,
          supabase
        );
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(
          event.data.object as Stripe.Invoice,
          supabase
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: DbClient,
) {
  const userId = session.metadata?.user_id;
  const tierId = session.metadata?.tier_id;

  if (!userId || !tierId) {
    console.error("Missing metadata in checkout session:", session.id);
    return;
  }

  console.log(`Checkout completed for user ${userId}, tier ${tierId}`);

  // Verify tier exists and get full details
  const { data: tier, error: tierError } = await supabase
    .from("membership_tiers")
    .select("id, name, display_name, price")
    .eq("id", tierId)
    .single();

  if (tierError || !tier) {
    console.error(`Tier ${tierId} not found in database:`, tierError);
    return;
  }

  console.log(`Found tier for checkout:`, {
    id: tier.id,
    name: tier.name,
    displayName: tier.display_name,
    price: tier.price,
  });

  // Create or update user membership record
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
      }
    );

  if (membershipError) {
    console.error("Error upserting membership:", membershipError);
  }

  // Update user's membership_status
  await supabase
    .from("users")
    .update({
      membership_status: tier.name,
      stripe_customer_id: session.customer as string,
    })
    .eq("id", userId);

  // Record initial payment in payments table
  if (session.amount_total && session.payment_intent) {
    await supabase.from("payments").insert({
      user_id: userId,
      amount: session.amount_total / 100, // Convert from cents
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

    console.log(
      `Payment recorded for user ${userId}: $${session.amount_total / 100}`
    );
  }

  console.log(`User ${userId} upgraded to ${tier.name}`);
}

async function handleSubscriptionUpdate(
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

  // Verify tier exists
  const { data: tier } = await supabase
    .from("membership_tiers")
    .select("id, name")
    .eq("id", tierId)
    .single();

  if (!tier) {
    console.error(`Tier ${tierId} not found in database`);
    return;
  }

  // Upsert user membership
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
    }
  );

  if (error) {
    console.error("Error upserting membership:", error);
    return;
  }

  // Update user's membership_status to the tier name
  await supabase
    .from("users")
    .update({
      membership_status: tier.name,
      stripe_customer_id: subscription.customer as string,
    })
    .eq("id", userId);

  console.log(
    `Subscription ${subscription.status} for user ${userId} - Tier: ${tier.name} (${tierId})`
  );
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: DbClient,
) {
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    console.error("No user_id in subscription metadata");
    return;
  }

  // Update membership status to cancelled
  await supabase
    .from("user_memberships")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  // Update user's membership_status
  await supabase
    .from("users")
    .update({ membership_status: "cancelled" })
    .eq("id", userId);

  console.log(`Subscription cancelled for user ${userId}`);
}

async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: DbClient,
) {
  const subscription = invoiceSubscriptionId(invoice);
  const userId = invoiceMetadataUserId(invoice);

  if (!userId) {
    console.error("No user_id in invoice metadata");
    return;
  }

  // Get tier name from user's membership
  const { data: membership } = await supabase
    .from("user_memberships")
    .select("tier:membership_tiers(name, display_name)")
    .eq("user_id", userId)
    .single();

  const tierName = membership?.tier?.display_name || "Membership";

  // Record payment
  await supabase.from("payments").insert({
    user_id: userId,
    amount: (invoice.amount_paid || 0) / 100, // Convert from cents
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

  console.log(
    `Payment succeeded for user ${userId}: $${(invoice.amount_paid || 0) / 100}`
  );
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: DbClient,
) {
  const userId = invoiceMetadataUserId(invoice);

  if (!userId) {
    console.error("No user_id in invoice metadata");
    return;
  }

  // Get tier name from user's membership
  const { data: membership } = await supabase
    .from("user_memberships")
    .select("tier:membership_tiers(name, display_name)")
    .eq("user_id", userId)
    .single();

  const tierName = membership?.tier?.display_name || "Membership";

  // Update membership status to past_due
  await supabase
    .from("user_memberships")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  // Update user's membership_status
  await supabase
    .from("users")
    .update({ membership_status: "past_due" })
    .eq("id", userId);

  // Record failed payment
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

  console.log(`Payment failed for user ${userId}`);
}
