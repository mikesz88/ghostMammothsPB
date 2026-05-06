import { SettingsMembershipBenefitsCard } from "@/components/settings/settings-membership-benefits-card";
import { SettingsMembershipCurrentCard } from "@/components/settings/settings-membership-current-card";
import { SettingsMembershipPageHeader } from "@/components/settings/settings-membership-page-header";
import { SettingsMembershipPaymentHistoryCard } from "@/components/settings/settings-membership-payment-history-card";

import type { SettingsMembershipPageClientProps } from "@/lib/settings/settings-membership-page-types";

type Props = SettingsMembershipPageClientProps & {
  actionLoading: boolean;
  onManageBilling: () => void;
  onCancelSubscription: () => void;
  onReactivateSubscription: () => void;
};

export function SettingsMembershipPageMain({
  membership,
  actionLoading,
  onManageBilling,
  onCancelSubscription,
  onReactivateSubscription,
}: Props) {
  return (
    <>
      <SettingsMembershipPageHeader />
      <SettingsMembershipCurrentCard
        membership={membership}
        actionLoading={actionLoading}
        onManageBilling={onManageBilling}
        onCancelSubscription={onCancelSubscription}
        onReactivateSubscription={onReactivateSubscription}
      />
      <SettingsMembershipBenefitsCard membership={membership} />
      <SettingsMembershipPaymentHistoryCard />
    </>
  );
}
