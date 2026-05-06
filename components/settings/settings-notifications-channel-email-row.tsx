import { Mail } from "lucide-react";

import { SettingsNotificationsChannelLead } from "@/components/settings/settings-notifications-channel-lead";
import { Switch } from "@/components/ui/switch";

type Props = {
  checked: boolean;
  onCheckedChange: () => void;
};

export function SettingsNotificationsChannelEmailRow({
  checked,
  onCheckedChange,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <SettingsNotificationsChannelLead
        icon={<Mail className="w-5 h-5 text-primary" />}
        htmlFor="email"
        descId="email-desc"
        title="Email Notifications"
        description="Receive updates via email"
      />
      <Switch
        id="email"
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-describedby="email-desc"
      />
    </div>
  );
}
