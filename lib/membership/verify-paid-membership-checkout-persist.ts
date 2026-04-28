import "server-only";

import { stripe } from "@/lib/stripe/server";
import { asSubscriptionWithBillingPeriods } from "@/lib/stripe/subscription-billing";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

import type { AppSupabaseClient } from "@/lib/membership/supabase-client-type";
import type {
  ValidCheckoutSessionContext,
  VerifyPaidMembershipCheckoutResult,
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
): Promise<{ error: string | null }> {
  const { error: membershipError } = await supabase
    .from("user_memberships")
    .upsert(paidCheckoutMembershipUpsertRow(args), {
      onConflict: "user_id",
    });
  if (membershipError) {
    console.error("Error updating membership:", membershipError);
    return { error: membershipError.message };
  }
  return { error: null };
}

async function updateUserMembershipStatusAfterCheckout(
  supabase: AppSupabaseClient,
  userId: string,
  membershipStatusName: string,
  customerId: string,
): Promise<{ error: string | null }> {
  const { error: userError } = await supabase
    .from("users")
    .update({
      membership_status: membershipStatusName,
      stripe_customer_id: customerId,
    })
    .eq("id", userId);
  if (userError) {
    console.error("Error updating users table:", userError);
    return { error: userError.message };
  }
  return { error: null };
}

async function persistMembershipAfterPaidCheckout(
  supabase: AppSupabaseClient,
  ctx: ValidCheckoutSessionContext,
): Promise<
  | { ok: true; payload: VerifyPaidMembershipCheckoutSuccess }
  | { ok: false; error: string }
> {
  const { userId, session, meta, tierStub } = ctx;
  const subscriptionId = session.subscription as string | null;
  const customerId = session.customer as string;
  const { start, end } = await subscriptionPeriodBounds(subscriptionId);

  const membershipResult = await upsertUserMembershipForPaidCheckout(supabase, {
    userId,
    tierId: meta.tierId,
    customerId,
    subscriptionId,
    currentPeriodStart: start,
    currentPeriodEnd: end,
  });
  if (membershipResult.error) {
    return { ok: false, error: membershipResult.error };
  }

  const userResult = await updateUserMembershipStatusAfterCheckout(
    supabase,
    userId,
    tierStub.name,
    customerId,
  );
  if (userResult.error) {
    return { ok: false, error: userResult.error };
  }

  return {
    ok: true,
    payload: {
      tierId: meta.tierId,
      tierName: meta.tierName,
      customerId,
      subscriptionId,
    },
  };
}

/**
 * Persists membership after Stripe confirms payment. Uses the **service role**
 * client so writes succeed under RLS (the user-scoped client cannot upsert
 * `user_memberships` in typical policies). Safe here because Stripe session
 * is verified and `ctx.userId` matches `session.metadata.user_id` before this runs.
 */
export async function finalizePaidMembershipAfterStripeSession(
  ctx: ValidCheckoutSessionContext,
): Promise<VerifyPaidMembershipCheckoutResult> {
  const admin = createServiceRoleClient();
  if (!admin) {
    return {
      ok: false,
      failure: {
        error:
          "Membership sync is unavailable. Set SUPABASE_SERVICE_ROLE_KEY on the server.",
        status: 503,
      },
    };
  }

  const result = await persistMembershipAfterPaidCheckout(admin, ctx);
  if (!result.ok) {
    return {
      ok: false,
      failure: {
        error: result.error,
        status: 500,
      },
    };
  }
  return { ok: true, data: result.payload };
}
