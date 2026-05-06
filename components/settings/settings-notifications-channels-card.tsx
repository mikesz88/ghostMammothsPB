import { SettingsNotificationsChannelBrowserRow } from "@/components/settings/settings-notifications-channel-browser-row";
import { SettingsNotificationsChannelEmailRow } from "@/components/settings/settings-notifications-channel-email-row";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type {
  SettingsNotificationsBooleanKey,
  SettingsNotificationsFormState,
} from "@/lib/settings/settings-notifications-form-types";

type Props = {
  settings: SettingsNotificationsFormState;
  onToggle: (key: SettingsNotificationsBooleanKey) => void;
};

export function SettingsNotificationsChannelsCard({
  settings,
  onToggle,
}: Props) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Notification Channels</CardTitle>
        <CardDescription>
          Choose how you want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SettingsNotificationsChannelBrowserRow
          checked={settings.browserNotifications}
          onCheckedChange={() => onToggle("browserNotifications")}
        />
        <SettingsNotificationsChannelEmailRow
          checked={settings.emailNotifications}
          onCheckedChange={() => onToggle("emailNotifications")}
        />
      </CardContent>
    </Card>
  );
}
