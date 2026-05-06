import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

type Props = {
  membership: UserMembershipInfo;
};

export function MembershipMarketingCurrentPlanRenewal({ membership }: Props) {
  if (!membership.isPaid || !membership.currentPeriodEnd) return null;
  return (
    <p className="text-sm text-muted-foreground mt-1">
      {membership.cancelAtPeriodEnd
        ? `Cancels on ${membership.currentPeriodEnd.toLocaleDateString()}`
        : `Renews on ${membership.currentPeriodEnd.toLocaleDateString()}`}
    </p>
  );
}
