import { SettingsMembershipCurrentCardBody } from "@/components/settings/settings-membership-current-card-body";
import { SettingsMembershipCurrentCardHeader } from "@/components/settings/settings-membership-current-card-header";
import { Card } from "@/components/ui/card";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

type Props = {
  membership: UserMembershipInfo;
  actionLoading: boolean;
  onManageBilling: () => void;
  onCancelSubscription: () => void;
  onReactivateSubscription: () => void;
};

export function SettingsMembershipCurrentCard(props: Props) {
  return (
    <Card className="border-border mb-6">
      <SettingsMembershipCurrentCardHeader membership={props.membership} />
      <SettingsMembershipCurrentCardBody {...props} />
    </Card>
  );
}
