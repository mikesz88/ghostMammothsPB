import { SettingsHubAccountAdminBadge } from "@/components/settings/settings-hub-account-admin-badge";
import { SettingsHubAccountInfoAvatar } from "@/components/settings/settings-hub-account-info-avatar";
import { SettingsHubAccountInfoMemberSince } from "@/components/settings/settings-hub-account-info-member-since";
import { SettingsHubAccountInfoNameEmail } from "@/components/settings/settings-hub-account-info-name-email";
import { SettingsHubAccountSkillLevel } from "@/components/settings/settings-hub-account-skill-level";

import type { SettingsHubPageClientProps } from "@/lib/settings/settings-hub-page-types";

type Props = Pick<
  SettingsHubPageClientProps,
  "session" | "userDetails"
>;

export function SettingsHubAccountInformationBody({
  session,
  userDetails,
}: Props) {
  return (
    <div className="flex items-start gap-4">
      <SettingsHubAccountInfoAvatar />
      <div className="flex-1 space-y-3">
        <SettingsHubAccountInfoNameEmail
          session={session}
          userDetails={userDetails}
        />
        <SettingsHubAccountSkillLevel userDetails={userDetails} />
        <SettingsHubAccountAdminBadge userDetails={userDetails} />
        <SettingsHubAccountInfoMemberSince createdAt={session.createdAt} />
      </div>
    </div>
  );
}
