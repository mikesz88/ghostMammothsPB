import "server-only";

import { requireUserSession } from "@/lib/auth/require-user-session";
import { verifyPaidMembershipCheckoutSession } from "@/lib/membership/verify-paid-membership-checkout-session";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

export type LoadMembershipSuccessPageDataResult =
  | { ok: true; tier: MembershipTierRow }
  | { ok: false };

export async function loadMembershipSuccessPageData(
  sessionId: string,
): Promise<LoadMembershipSuccessPageDataResult> {
  const { supabase, user } = await requireUserSession();
  const verify = await verifyPaidMembershipCheckoutSession(
    supabase,
    user.id,
    sessionId,
  );
  if (!verify.ok) {
    return { ok: false };
  }
  const { data: tier, error } = await supabase
    .from("membership_tiers")
    .select("*")
    .eq("id", verify.data.tierId)
    .maybeSingle();

  if (error || !tier) {
    return { ok: false };
  }
  return { ok: true, tier };
}
