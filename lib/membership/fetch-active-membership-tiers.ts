import "server-only";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";
import type { AppSupabaseClient } from "@/lib/membership/supabase-client-type";

export async function fetchActiveMembershipTiers(supabase: AppSupabaseClient) {
  return supabase
    .from("membership_tiers")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .returns<MembershipTierRow[]>();
}
