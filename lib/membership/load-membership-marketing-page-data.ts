import "server-only";

import { requireUserSession } from "@/lib/auth/require-user-session";
import { fetchActiveMembershipTiers } from "@/lib/membership/fetch-active-membership-tiers";
import { getUserMembership } from "@/lib/membership/get-user-membership";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";
import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

export async function loadMembershipMarketingPageData(): Promise<{
  tiers: MembershipTierRow[];
  membership: UserMembershipInfo;
  tiersErrorMessage: string | null;
}> {
  const { supabase, user } = await requireUserSession();
  const [tiersResult, membership] = await Promise.all([
    fetchActiveMembershipTiers(supabase),
    getUserMembership(user.id, supabase),
  ]);
  return {
    tiers: tiersResult.data ?? [],
    membership,
    tiersErrorMessage: tiersResult.error?.message ?? null,
  };
}
