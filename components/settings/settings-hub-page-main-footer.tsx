import { SettingsHubAccountControlsCard } from "@/components/settings/settings-hub-account-controls-card";
import { SettingsHubQuickActionsCard } from "@/components/settings/settings-hub-quick-actions-card";
import { SettingsHubSettingsLinksSection } from "@/components/settings/settings-hub-settings-links-section";

import type { SettingsHubPageClientProps } from "@/lib/settings/settings-hub-page-types";

type Props = Pick<
  SettingsHubPageClientProps,
  "userDetails" | "membership"
> & {
  deleteLoading: boolean;
  onDeleteAccount: () => void;
};

export function SettingsHubPageMainFooter({
  userDetails,
  membership,
  deleteLoading,
  onDeleteAccount,
}: Props) {
  return (
    <>
      <SettingsHubSettingsLinksSection />
      <SettingsHubQuickActionsCard
        userDetails={userDetails}
        membership={membership}
      />
      <SettingsHubAccountControlsCard
        deleteLoading={deleteLoading}
        onDeleteAccount={onDeleteAccount}
      />
    </>
  );
}
