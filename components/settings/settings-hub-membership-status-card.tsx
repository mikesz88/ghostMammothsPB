import { SettingsHubMembershipStatusBody } from "@/components/settings/settings-hub-membership-status-body";
import { SettingsHubMembershipStatusHeader } from "@/components/settings/settings-hub-membership-status-header";
import { Card } from "@/components/ui/card";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

export function SettingsHubMembershipStatusCard({
  membership,
}: {
  membership: UserMembershipInfo;
}) {
  return (
    <Card className="border-border mb-6">
      <SettingsHubMembershipStatusHeader membership={membership} />
      <SettingsHubMembershipStatusBody membership={membership} />
    </Card>
  );
}
