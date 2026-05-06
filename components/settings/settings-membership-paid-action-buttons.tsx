import { SettingsMembershipCancelOrReactivateButtons } from "@/components/settings/settings-membership-cancel-or-reactivate-buttons";
import { SettingsMembershipManageBillingButton } from "@/components/settings/settings-membership-manage-billing-button";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

type Props = {
  membership: UserMembershipInfo;
  actionLoading: boolean;
  onManageBilling: () => void;
  onCancel: () => void;
  onReactivate: () => void;
};

export function SettingsMembershipPaidActionButtons({
  membership,
  actionLoading,
  onManageBilling,
  onCancel,
  onReactivate,
}: Props) {
  return (
    <div className="flex gap-3 pt-4">
      <SettingsMembershipManageBillingButton
        actionLoading={actionLoading}
        onManageBilling={onManageBilling}
      />
      <SettingsMembershipCancelOrReactivateButtons
        membership={membership}
        actionLoading={actionLoading}
        onCancel={onCancel}
        onReactivate={onReactivate}
      />
    </div>
  );
}
