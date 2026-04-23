import { Crown } from "lucide-react";

import { MembershipMarketingCurrentPlanRenewal } from "@/components/membership/membership-marketing-current-plan-renewal";
import { Badge } from "@/components/ui/badge";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

type Props = {
  displayName: string;
  membership: UserMembershipInfo;
};

export function MembershipMarketingCurrentPlanInner({
  displayName,
  membership,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
        <p className="text-2xl font-bold text-foreground">{displayName}</p>
        <MembershipMarketingCurrentPlanRenewal membership={membership} />
      </div>
      {membership.isPaid ? (
        <Badge variant="default">
          <Crown className="w-3 h-3 mr-1" />
          Active
        </Badge>
      ) : null}
    </div>
  );
}
