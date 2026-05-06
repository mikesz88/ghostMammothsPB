import { SettingsNotificationsTypesList } from "@/components/settings/settings-notifications-types-list";
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

export function SettingsNotificationsTypesCard({
  settings,
  onToggle,
}: Props) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Notification Types</CardTitle>
        <CardDescription>
          Choose which events trigger notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingsNotificationsTypesList
          settings={settings}
          onToggle={onToggle}
        />
      </CardContent>
    </Card>
  );
}
