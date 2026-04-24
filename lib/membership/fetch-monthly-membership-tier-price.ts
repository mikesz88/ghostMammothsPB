import "server-only";

import type { AppSupabaseClient } from "@/lib/membership/supabase-client-type";

export async function fetchMonthlyMembershipTierPrice(
  supabase: AppSupabaseClient,
): Promise<number | null> {
  const { data } = await supabase
    .from("membership_tiers")
    .select("price")
    .eq("name", "monthly")
    .maybeSingle();
  if (data == null || typeof data.price !== "number") {
    return null;
  }
  return data.price;
}
