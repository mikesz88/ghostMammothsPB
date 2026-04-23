import "server-only";

import { requireUserSession } from "@/lib/auth/require-user-session";
import { fetchMembershipTierForCheckout } from "@/lib/membership/fetch-membership-tier-for-checkout";

export async function loadMembershipCheckoutPageData(tierId: string) {
  const { supabase } = await requireUserSession();
  return fetchMembershipTierForCheckout(supabase, tierId);
}
