import { Bell } from "lucide-react";

import { SettingsNotificationsChannelLead } from "@/components/settings/settings-notifications-channel-lead";
import { Switch } from "@/components/ui/switch";

type Props = {
  checked: boolean;
  onCheckedChange: () => void;
};

export function SettingsNotificationsChannelBrowserRow({
  checked,
  onCheckedChange,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <SettingsNotificationsChannelLead
        icon={<Bell className="w-5 h-5 text-primary" />}
        htmlFor="browser"
        descId="browser-desc"
        title="Browser Notifications"
        description="Get instant alerts in your browser"
      />
      <Switch
        id="browser"
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-describedby="browser-desc"
      />
    </div>
  );
}
