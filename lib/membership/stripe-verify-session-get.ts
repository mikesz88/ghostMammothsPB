import { NextRequest, NextResponse } from "next/server";

import { verifyPaidMembershipCheckoutSession } from "@/lib/membership/verify-paid-membership-checkout-session";

import type { AppSupabaseClient } from "@/lib/membership/supabase-client-type";
import type { VerifyPaidMembershipCheckoutResult } from "@/lib/membership/verify-paid-membership-checkout-types";

function verifySessionNextResponse(result: VerifyPaidMembershipCheckoutResult) {
  if (!result.ok) {
    return NextResponse.json(
      { error: result.failure.error },
      { status: result.failure.status },
    );
  }
  const d = result.data;
  return NextResponse.json({
    tier_id: d.tierId,
    tier_name: d.tierName,
    customer_id: d.customerId,
    subscription_id: d.subscriptionId,
  });
}

export async function respondToStripeVerifySessionGet(
  supabase: AppSupabaseClient,
  userId: string,
  sessionId: string | null,
) {
  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 },
    );
  }
  const result = await verifyPaidMembershipCheckoutSession(
    supabase,
    userId,
    sessionId,
  );
  return verifySessionNextResponse(result);
}

export function sessionIdFromVerifySessionRequest(request: NextRequest) {
  return request.nextUrl.searchParams.get("session_id");
}
