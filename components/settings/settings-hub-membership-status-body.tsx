import { SettingsHubMembershipManageButton } from "@/components/settings/settings-hub-membership-manage-button";
import { SettingsHubMembershipPlanLines } from "@/components/settings/settings-hub-membership-plan-lines";
import { CardContent } from "@/components/ui/card";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

export function SettingsHubMembershipStatusBody({
  membership,
}: {
  membership: UserMembershipInfo;
}) {
  return (
    <CardContent>
      <div className="flex items-center justify-between">
        <SettingsHubMembershipPlanLines membership={membership} />
        <SettingsHubMembershipManageButton />
      </div>
    </CardContent>
  );
}
