import "server-only";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";
import type { AppSupabaseClient } from "@/lib/membership/supabase-client-type";

export type MembershipCheckoutTierInvalidReason =
  | "not_found"
  | "not_paid"
  | "no_stripe_price";

export type FetchMembershipTierForCheckoutResult =
  | { ok: true; tier: MembershipTierRow }
  | { ok: false; reason: MembershipCheckoutTierInvalidReason };

export async function fetchMembershipTierForCheckout(
  supabase: AppSupabaseClient,
  tierId: string,
): Promise<FetchMembershipTierForCheckoutResult> {
  const { data, error } = await supabase
    .from("membership_tiers")
    .select("*")
    .eq("id", tierId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, reason: "not_found" };
  }
  if (data.price <= 0) {
    return { ok: false, reason: "not_paid" };
  }
  if (!data.stripe_price_id) {
    return { ok: false, reason: "no_stripe_price" };
  }
  return { ok: true, tier: data };
}
