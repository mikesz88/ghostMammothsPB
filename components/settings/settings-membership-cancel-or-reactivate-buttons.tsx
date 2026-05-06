import { SettingsMembershipCancelMembershipButton } from "@/components/settings/settings-membership-cancel-membership-button";
import { SettingsMembershipReactivateButton } from "@/components/settings/settings-membership-reactivate-button";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

type Props = {
  membership: UserMembershipInfo;
  actionLoading: boolean;
  onCancel: () => void;
  onReactivate: () => void;
};

export function SettingsMembershipCancelOrReactivateButtons({
  membership,
  actionLoading,
  onCancel,
  onReactivate,
}: Props) {
  if (membership.cancelAtPeriodEnd) {
    return (
      <SettingsMembershipReactivateButton
        actionLoading={actionLoading}
        onReactivate={onReactivate}
      />
    );
  }
  return (
    <SettingsMembershipCancelMembershipButton
      actionLoading={actionLoading}
      onCancel={onCancel}
    />
  );
}
