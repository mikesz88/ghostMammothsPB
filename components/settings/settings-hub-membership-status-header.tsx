import { Crown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

export function SettingsHubMembershipStatusHeader({
  membership,
}: {
  membership: UserMembershipInfo;
}) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Membership Status</CardTitle>
          <CardDescription>Your current subscription plan</CardDescription>
        </div>
        {membership.isPaid ? (
          <Badge variant="default">
            <Crown className="w-3 h-3 mr-1" />
            {membership.tierDisplayName}
          </Badge>
        ) : (
          <Badge variant="secondary">{membership.tierDisplayName}</Badge>
        )}
      </div>
    </CardHeader>
  );
}
