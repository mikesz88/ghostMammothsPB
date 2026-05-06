import "server-only";

import { requireUserSession } from "@/lib/auth/require-user-session";
import { fetchMonthlyMembershipTierPrice } from "@/lib/membership/fetch-monthly-membership-tier-price";
import { getUserMembership } from "@/lib/membership/get-user-membership";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

const DEFAULT_MONTHLY_PRICE = 35;

export async function loadSettingsMembershipPageData(): Promise<{
  membership: UserMembershipInfo;
  monthlyTierPrice: number;
}> {
  const { supabase, user } = await requireUserSession();
  const [membership, monthlyPrice] = await Promise.all([
    getUserMembership(user.id, supabase),
    fetchMonthlyMembershipTierPrice(supabase),
  ]);
  return {
    membership,
    monthlyTierPrice: monthlyPrice ?? DEFAULT_MONTHLY_PRICE,
  };
}
