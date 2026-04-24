"use client";

import { SettingsMembershipPageMain } from "@/components/settings/settings-membership-page-main";
import { SettingsMembershipPageShell } from "@/components/settings/settings-membership-page-shell";
import { useSettingsMembershipPageActions } from "@/lib/hooks/use-settings-membership-page-actions";

import type { SettingsMembershipPageClientProps } from "@/lib/settings/settings-membership-page-types";

export function SettingsMembershipPageClient({
  membership,
}: SettingsMembershipPageClientProps) {
  const {
    actionLoading,
    handleCancelSubscription,
    handleReactivateSubscription,
    handleManageBilling,
  } = useSettingsMembershipPageActions();

  return (
    <SettingsMembershipPageShell>
      <SettingsMembershipPageMain
        membership={membership}
        actionLoading={actionLoading}
        onManageBilling={handleManageBilling}
        onCancelSubscription={handleCancelSubscription}
        onReactivateSubscription={handleReactivateSubscription}
      />
    </SettingsMembershipPageShell>
  );
}
