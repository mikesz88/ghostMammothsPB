import "server-only";

import { stripe } from "@/lib/stripe/server";
import { asSubscriptionWithBillingPeriods } from "@/lib/stripe/subscription-billing";

import type { AppSupabaseClient } from "@/lib/membership/supabase-client-type";
import type {
  ValidCheckoutSessionContext,
  VerifyPaidMembershipCheckoutSuccess,
} from "@/lib/membership/verify-paid-membership-checkout-types";

async function subscriptionPeriodBounds(
  subscriptionId: string | null,
): Promise<{ start?: string; end?: string }> {
  if (!subscriptionId) {
    return {};
  }
  try {
    const subscription = asSubscriptionWithBillingPeriods(
      await stripe.subscriptions.retrieve(subscriptionId),
    );
    return {
      start: new Date(subscription.current_period_start * 1000).toISOString(),
      end: new Date(subscription.current_period_end * 1000).toISOString(),
    };
  } catch {
    return {};
  }
}

function paidCheckoutMembershipUpsertRow(args: {
  userId: string;
  tierId: string;
  customerId: string;
  subscriptionId: string | null;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}) {
  return {
    user_id: args.userId,
    tier_id: args.tierId,
    status: "active" as const,
    stripe_customer_id: args.customerId,
    stripe_subscription_id: args.subscriptionId,
    current_period_start: args.currentPeriodStart,
    current_period_end: args.currentPeriodEnd,
    cancel_at_period_end: false,
    updated_at: new Date().toISOString(),
  };
}

async function upsertUserMembershipForPaidCheckout(
  supabase: AppSupabaseClient,
  args: {
    userId: string;
    tierId: string;
    customerId: string;
    subscriptionId: string | null;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
  },
) {
  const { error: membershipError } = await supabase
    .from("user_memberships")
    .upsert(paidCheckoutMembershipUpsertRow(args), {
      onConflict: "user_id",
    });
  if (membershipError) {
    console.error("Error updating membership:", membershipError);
  }
}

async function updateUserMembershipStatusAfterCheckout(
  supabase: AppSupabaseClient,
  userId: string,
  membershipStatusName: string,
  customerId: string,
) {
  const { error: userError } = await supabase
    .from("users")
    .update({
      membership_status: membershipStatusName,
      stripe_customer_id: customerId,
    })
    .eq("id", userId);
  if (userError) {
    console.error("Error updating users table:", userError);
  }
}

async function persistMembershipAfterPaidCheckout(
  supabase: AppSupabaseClient,
  ctx: ValidCheckoutSessionContext,
) {
  const { userId, session, meta, tierStub } = ctx;
  const subscriptionId = session.subscription as string | null;
  const customerId = session.customer as string;
  const { start, end } = await subscriptionPeriodBounds(subscriptionId);
  await upsertUserMembershipForPaidCheckout(supabase, {
    userId,
    tierId: meta.tierId,
    customerId,
    subscriptionId,
    currentPeriodStart: start,
    currentPeriodEnd: end,
  });
  await updateUserMembershipStatusAfterCheckout(
    supabase,
    userId,
    tierStub.name,
    customerId,
  );
  return { meta, customerId, subscriptionId };
}

export async function finalizePaidMembershipAfterStripeSession(
  supabase: AppSupabaseClient,
  ctx: ValidCheckoutSessionContext,
): Promise<VerifyPaidMembershipCheckoutSuccess> {
  const { meta, customerId, subscriptionId } =
    await persistMembershipAfterPaidCheckout(supabase, ctx);
  return {
    tierId: meta.tierId,
    tierName: meta.tierName,
    customerId,
    subscriptionId,
  };
}
