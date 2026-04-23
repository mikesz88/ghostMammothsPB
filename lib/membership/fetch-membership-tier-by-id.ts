import "server-only";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";
import type { AppSupabaseClient } from "@/lib/membership/supabase-client-type";

export async function fetchMembershipTierById(
  supabase: AppSupabaseClient,
  tierId: string,
): Promise<MembershipTierRow | null> {
  const { data, error } = await supabase
    .from("membership_tiers")
    .select("*")
    .eq("id", tierId)
    .maybeSingle();
  if (error || !data) {
    return null;
  }
  return data;
}
