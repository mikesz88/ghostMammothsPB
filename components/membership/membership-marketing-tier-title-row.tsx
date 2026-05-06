import { Badge } from "@/components/ui/badge";
import { CardDescription, CardTitle } from "@/components/ui/card";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

type Props = {
  tier: MembershipTierRow;
  isCurrent: boolean;
  isPaidTier: boolean;
};

export function MembershipMarketingTierTitleRow({
  tier,
  isCurrent,
  isPaidTier,
}: Props) {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <CardTitle className="text-2xl">{tier.display_name}</CardTitle>
        {isCurrent && !isPaidTier ? (
          <Badge variant="outline">Current Plan</Badge>
        ) : null}
        {isPaidTier && tier.billing_period === "monthly" && !isCurrent ? (
          <Badge variant="default">Popular</Badge>
        ) : null}
      </div>
      <CardDescription>{tier.description || ""}</CardDescription>
    </>
  );
}
