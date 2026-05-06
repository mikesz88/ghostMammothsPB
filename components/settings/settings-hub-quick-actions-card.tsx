import { SettingsHubQuickActionAdmin } from "@/components/settings/settings-hub-quick-action-admin";
import { SettingsHubQuickActionBrowseEvents } from "@/components/settings/settings-hub-quick-action-browse-events";
import { SettingsHubQuickActionUpgrade } from "@/components/settings/settings-hub-quick-action-upgrade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";
import type { SettingsHubUsersRow } from "@/lib/settings/settings-hub-page-types";

type Props = {
  userDetails: SettingsHubUsersRow | null;
  membership: UserMembershipInfo;
};

export function SettingsHubQuickActionsCard({
  userDetails,
  membership,
}: Props) {
  return (
    <Card className="border-border mt-6">
      <CardHeader>
        <CardTitle className="text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <SettingsHubQuickActionBrowseEvents />
        {!membership.isPaid ? <SettingsHubQuickActionUpgrade /> : null}
        {userDetails?.is_admin ? <SettingsHubQuickActionAdmin /> : null}
      </CardContent>
    </Card>
  );
}
