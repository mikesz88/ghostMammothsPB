import { SettingsMembershipPaidActionButtons } from "@/components/settings/settings-membership-paid-action-buttons";
import { SettingsMembershipPlanPriceRow } from "@/components/settings/settings-membership-plan-price-row";
import { SettingsMembershipRenewalBlock } from "@/components/settings/settings-membership-renewal-block";
import { SettingsMembershipUpgradeButton } from "@/components/settings/settings-membership-upgrade-button";
import { CardContent } from "@/components/ui/card";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

type Props = {
  membership: UserMembershipInfo;
  actionLoading: boolean;
  onManageBilling: () => void;
  onCancelSubscription: () => void;
  onReactivateSubscription: () => void;
};

export function SettingsMembershipCurrentCardBody({
  membership,
  actionLoading,
  onManageBilling,
  onCancelSubscription,
  onReactivateSubscription,
}: Props) {
  return (
    <CardContent className="space-y-4">
      <SettingsMembershipPlanPriceRow membership={membership} />
      <SettingsMembershipRenewalBlock membership={membership} />
      {membership.isPaid ? (
        <SettingsMembershipPaidActionButtons
          membership={membership}
          actionLoading={actionLoading}
          onManageBilling={onManageBilling}
          onCancel={onCancelSubscription}
          onReactivate={onReactivateSubscription}
        />
      ) : (
        <SettingsMembershipUpgradeButton />
      )}
    </CardContent>
  );
}
