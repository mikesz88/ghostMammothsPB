import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import Stripe from "stripe";

type SupabaseClient = ReturnType<typeof createServiceRoleClient>;

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

  const supabase = createServiceRoleClient();

  if (!supabase) {
    console.error(
      "Supabase service-role key not configured; cannot process Stripe webhook."
    );
    return NextResponse.json({ received: true, skipped: true });
  }

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
        break;
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
  supabase: NonNullable<SupabaseClient>
) {
  const userId = session.metadata?.user_id;
  const tierId = session.metadata?.tier_id;

  if (!userId || !tierId) {
    console.error("Missing metadata in checkout session:", session.id);
    return;
  }

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

  const sessionData = session as unknown as { customer?: string | { id?: string }; subscription?: string | { id?: string }; payment_intent?: string | { id?: string } };
  // Create or update user membership record
  const { error: membershipError } = await supabase
    .from("user_memberships")
    .upsert(
      {
        user_id: userId,
        tier_id: tierId,
        status: "active",
        stripe_customer_id: typeof sessionData.customer === 'string' ? sessionData.customer : sessionData.customer?.id || null,
        stripe_subscription_id: typeof sessionData.subscription === 'string' ? sessionData.subscription : sessionData.subscription?.id || null,
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
      stripe_customer_id: typeof sessionData.customer === 'string' ? sessionData.customer : sessionData.customer?.id || null,
    })
    .eq("id", userId);

  // Record initial payment in payments table
  if (session.amount_total && sessionData.payment_intent) {
    await supabase.from("payments").insert({
      user_id: userId,
      amount: session.amount_total / 100, // Convert from cents
      currency: session.currency?.toUpperCase() || "USD",
      payment_type: "membership",
      stripe_payment_intent_id: typeof sessionData.payment_intent === 'string' ? sessionData.payment_intent : sessionData.payment_intent?.id || null,
      status: "succeeded",
      description: `${tier.display_name} - Initial subscription payment`,
      metadata: {
        checkout_session_id: session.id,
        subscription_id: typeof sessionData.subscription === 'string' ? sessionData.subscription : sessionData.subscription?.id || null,
        tier_id: tierId,
        tier_name: tier.name,
      },
    });
  }
}

async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  supabase: NonNullable<SupabaseClient>
) {
  const userId = subscription.metadata.user_id;
  const tierId = subscription.metadata.tier_id;
  const tierName = subscription.metadata.tier_name;

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
  const subscriptionData = subscription as unknown as { current_period_start?: number; current_period_end?: number; cancel_at_period_end?: boolean };
  const { error } = await supabase.from("user_memberships").upsert(
    {
      user_id: userId,
      tier_id: tierId,
      status: subscription.status,
      stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
      stripe_subscription_id: subscription.id,
      current_period_start: subscriptionData.current_period_start ? new Date(subscriptionData.current_period_start * 1000).toISOString() : null,
      current_period_end: subscriptionData.current_period_end ? new Date(subscriptionData.current_period_end * 1000).toISOString() : null,
      cancel_at_period_end: subscriptionData.cancel_at_period_end || false,
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
      stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
    })
    .eq("id", userId);
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: NonNullable<SupabaseClient>
) {
  const userId = subscription.metadata.user_id;

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
}

async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: NonNullable<SupabaseClient>
) {
  const invoiceData = invoice as unknown as { subscription?: string | { id?: string }; payment_intent?: string | { id?: string } };
  const subscription = typeof invoiceData.subscription === 'string' ? invoiceData.subscription : invoiceData.subscription?.id || null;
  const userId = invoice.lines.data[0]?.metadata?.user_id || null;

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
  const paymentIntentId = typeof invoiceData.payment_intent === 'string' ? invoiceData.payment_intent : invoiceData.payment_intent?.id || null;
  await supabase.from("payments").insert({
    user_id: userId,
    amount: (invoice.amount_paid || 0) / 100, // Convert from cents
    currency: invoice.currency.toUpperCase(),
    payment_type: "membership",
    stripe_payment_intent_id: paymentIntentId,
    status: "succeeded",
    description: `${tierName} payment`,
    metadata: {
      invoice_id: invoice.id,
      subscription_id: subscription,
    },
  });
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: NonNullable<SupabaseClient>
) {
  const invoiceData = invoice as unknown as { subscription?: string | { id?: string } };
  const userId = invoice.lines.data[0]?.metadata?.user_id || null;

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
  const subscriptionId = typeof invoiceData.subscription === 'string' ? invoiceData.subscription : invoiceData.subscription?.id || null;
  await supabase.from("payments").insert({
    user_id: userId,
    amount: (invoice.amount_due || 0) / 100,
    currency: invoice.currency.toUpperCase(),
    payment_type: "membership",
    status: "failed",
    description: `Failed ${tierName} payment`,
    metadata: {
      invoice_id: invoice.id,
      subscription_id: subscriptionId,
    },
  });
}
