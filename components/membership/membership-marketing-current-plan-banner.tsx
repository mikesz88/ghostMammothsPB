import { MembershipMarketingCurrentPlanInner } from "@/components/membership/membership-marketing-current-plan-inner";
import { Card, CardContent } from "@/components/ui/card";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";
import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

type Props = {
  tiers: MembershipTierRow[];
  membership: UserMembershipInfo;
};

export function MembershipMarketingCurrentPlanBanner({
  tiers,
  membership,
}: Props) {
  const currentTierName = membership.tierName || "free";
  const displayName =
    tiers.find((t) => t.name === currentTierName)?.display_name || "Unknown Plan";

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <Card className="border-primary bg-primary/5">
        <CardContent className="p-6">
          <MembershipMarketingCurrentPlanInner
            displayName={displayName}
            membership={membership}
          />
        </CardContent>
      </Card>
    </div>
  );
}
