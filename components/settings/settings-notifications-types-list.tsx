import { SettingsNotificationsTypeSwitchRow } from "@/components/settings/settings-notifications-type-switch-row";
import { SETTINGS_NOTIFICATION_TYPE_ROWS } from "@/lib/settings/settings-notifications-type-rows";

import type {
  SettingsNotificationsBooleanKey,
  SettingsNotificationsFormState,
} from "@/lib/settings/settings-notifications-form-types";

type Props = {
  settings: SettingsNotificationsFormState;
  onToggle: (key: SettingsNotificationsBooleanKey) => void;
};

export function SettingsNotificationsTypesList({
  settings,
  onToggle,
}: Props) {
  return (
    <>
      {SETTINGS_NOTIFICATION_TYPE_ROWS.map((row) => (
        <SettingsNotificationsTypeSwitchRow
          key={row.id}
          id={row.id}
          label={row.label}
          description={row.description}
          checked={settings[row.key]}
          onCheckedChange={() => onToggle(row.key)}
        />
      ))}
    </>
  );
}
