import { SettingsHubPageMainFooter } from "@/components/settings/settings-hub-page-main-footer";
import { SettingsHubPageMainOverview } from "@/components/settings/settings-hub-page-main-overview";

import type { SettingsHubPageClientProps } from "@/lib/settings/settings-hub-page-types";

type Props = SettingsHubPageClientProps & {
  deleteLoading: boolean;
  onDeleteAccount: () => void;
};

export function SettingsHubPageMain({
  session,
  userDetails,
  membership,
  deleteLoading,
  onDeleteAccount,
}: Props) {
  return (
    <>
      <SettingsHubPageMainOverview
        session={session}
        userDetails={userDetails}
        membership={membership}
      />
      <SettingsHubPageMainFooter
        userDetails={userDetails}
        membership={membership}
        deleteLoading={deleteLoading}
        onDeleteAccount={onDeleteAccount}
      />
    </>
  );
}
