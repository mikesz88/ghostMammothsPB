import "server-only";

import { finalizePaidMembershipAfterStripeSession } from "@/lib/membership/verify-paid-membership-checkout-persist";
import { stripe } from "@/lib/stripe/server";

import type { AppSupabaseClient } from "@/lib/membership/supabase-client-type";
import type {
  ValidCheckoutSessionContext,
  VerifyPaidMembershipCheckoutResult,
} from "@/lib/membership/verify-paid-membership-checkout-types";
import type Stripe from "stripe";

export type {
  VerifyPaidMembershipCheckoutFailure,
  VerifyPaidMembershipCheckoutResult,
  VerifyPaidMembershipCheckoutSuccess,
} from "@/lib/membership/verify-paid-membership-checkout-types";

function failure(
  error: string,
  status: number,
): VerifyPaidMembershipCheckoutResult {
  return { ok: false, failure: { error, status } };
}

function validateSessionUserAndPayment(
  session: Stripe.Checkout.Session,
  userId: string,
): VerifyPaidMembershipCheckoutResult | null {
  if (session.metadata?.user_id !== userId) {
    return failure("Unauthorized access to this session", 403);
  }
  if (session.payment_status !== "paid") {
    return failure("Payment not completed", 400);
  }
  return null;
}

function readTierMeta(
  session: Stripe.Checkout.Session,
): { tierId: string; tierName: string } | null {
  const tierId = session.metadata?.tier_id;
  const tierName = session.metadata?.tier_name;
  if (!tierId || !tierName) {
    return null;
  }
  return { tierId, tierName };
}

async function fetchTierStubForVerify(
  supabase: AppSupabaseClient,
  tierId: string,
): Promise<{ name: string } | null> {
  const { data, error } = await supabase
    .from("membership_tiers")
    .select("id, name, display_name")
    .eq("id", tierId)
    .single();
  if (error || !data) {
    return null;
  }
  return { name: data.name };
}

async function loadValidCheckoutSessionForVerify(
  supabase: AppSupabaseClient,
  userId: string,
  sessionId: string,
): Promise<VerifyPaidMembershipCheckoutResult | ValidCheckoutSessionContext> {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const authErr = validateSessionUserAndPayment(session, userId);
  if (authErr) {
    return authErr;
  }
  const meta = readTierMeta(session);
  if (!meta) {
    return failure("Missing tier information in session", 400);
  }
  const tierStub = await fetchTierStubForVerify(supabase, meta.tierId);
  if (!tierStub) {
    return failure("Invalid tier", 400);
  }
  return { userId, session, meta, tierStub };
}

export async function verifyPaidMembershipCheckoutSession(
  supabase: AppSupabaseClient,
  userId: string,
  sessionId: string,
): Promise<VerifyPaidMembershipCheckoutResult> {
  const ctx = await loadValidCheckoutSessionForVerify(
    supabase,
    userId,
    sessionId,
  );
  if (!("tierStub" in ctx)) {
    return ctx;
  }
  const data = await finalizePaidMembershipAfterStripeSession(supabase, ctx);
  return { ok: true, data };
}
