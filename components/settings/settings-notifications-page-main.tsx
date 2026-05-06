import { SettingsNotificationsChannelsCard } from "@/components/settings/settings-notifications-channels-card";
import { SettingsNotificationsPageIntro } from "@/components/settings/settings-notifications-page-intro";
import { SettingsNotificationsSaveButton } from "@/components/settings/settings-notifications-save-button";
import { SettingsNotificationsTypesCard } from "@/components/settings/settings-notifications-types-card";

import type { SettingsNotificationsBooleanKey , SettingsNotificationsFormState } from "@/lib/settings/settings-notifications-form-types";

type Props = {
  settings: SettingsNotificationsFormState;
  onToggle: (key: SettingsNotificationsBooleanKey) => void;
  onSave: () => void;
};

export function SettingsNotificationsPageMain({
  settings,
  onToggle,
  onSave,
}: Props) {
  return (
    <>
      <SettingsNotificationsPageIntro />
      <div className="space-y-6">
        <SettingsNotificationsChannelsCard
          settings={settings}
          onToggle={onToggle}
        />
        <SettingsNotificationsTypesCard
          settings={settings}
          onToggle={onToggle}
        />
        <SettingsNotificationsSaveButton onSave={onSave} />
      </div>
    </>
  );
}
