import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";
import type { MembershipStatus } from "@/lib/types-membership";


type TierFields = {
  name: string;
  display_name: string;
  price: number;
  billing_period: string;
};

type MembershipRowFields = {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
};

export function buildUserMembershipFromRow(
  tier: TierFields,
  membershipRow: MembershipRowFields,
): UserMembershipInfo {
  const isActive =
    membershipRow.status === "active" || membershipRow.status === "trialing";
  const isPaid = Number(tier.price) > 0;

  return {
    status: membershipRow.status as MembershipStatus,
    tierName: tier.name,
    tierDisplayName: tier.display_name,
    tierPrice: tier.price,
    tierBillingPeriod: tier.billing_period,
    isActive,
    isPaid,
    currentPeriodEnd: membershipRow.current_period_end
      ? new Date(membershipRow.current_period_end)
      : undefined,
    cancelAtPeriodEnd: membershipRow.cancel_at_period_end ?? undefined,
  };
}
