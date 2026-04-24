import type { AppSupabaseClient } from "@/lib/membership/supabase-client-type";

/** Match `users.membership_status` to a row in `membership_tiers` by `name` or `display_name`. */
export async function fetchTierByMembershipStatusLabel(
  supabase: AppSupabaseClient,
  label: string,
) {
  const { data: byName } = await supabase
    .from("membership_tiers")
    .select("*")
    .eq("name", label)
    .maybeSingle();

  if (byName) return byName;

  const { data: byDisplay } = await supabase
    .from("membership_tiers")
    .select("*")
    .eq("display_name", label)
    .maybeSingle();

  return byDisplay ?? null;
}
