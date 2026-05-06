import { SettingsHubAccountInformationCard } from "@/components/settings/settings-hub-account-information-card";
import { SettingsHubMembershipStatusCard } from "@/components/settings/settings-hub-membership-status-card";
import { SettingsHubPageHeader } from "@/components/settings/settings-hub-page-header";

import type { SettingsHubPageClientProps } from "@/lib/settings/settings-hub-page-types";

type Props = Pick<
  SettingsHubPageClientProps,
  "session" | "userDetails" | "membership"
>;

export function SettingsHubPageMainOverview({
  session,
  userDetails,
  membership,
}: Props) {
  return (
    <>
      <SettingsHubPageHeader />
      <SettingsHubAccountInformationCard
        session={session}
        userDetails={userDetails}
      />
      <SettingsHubMembershipStatusCard membership={membership} />
    </>
  );
}
