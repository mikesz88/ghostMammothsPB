import { Badge } from "@/components/ui/badge";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMembershipBadgeVariant } from "@/lib/membership-helpers";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

export function SettingsMembershipCurrentCardHeader({
  membership,
}: {
  membership: UserMembershipInfo;
}) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Current Membership</CardTitle>
          <CardDescription>Your active subscription plan</CardDescription>
        </div>
        <Badge variant={getMembershipBadgeVariant(membership.status)}>
          {membership.status}
        </Badge>
      </div>
    </CardHeader>
  );
}
