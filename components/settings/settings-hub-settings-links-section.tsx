import { Bell, CreditCard } from "lucide-react";

import { SettingsHubPrefNavigationCard } from "@/components/settings/settings-hub-pref-navigation-card";

export function SettingsHubSettingsLinksSection() {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Settings & Preferences
      </h2>
      <SettingsHubPrefNavigationCard
        href="/settings/membership"
        title="Membership & Billing"
        description="Manage your subscription, billing, and payment methods"
        icon={<CreditCard className="w-6 h-6 text-primary" />}
      />
      <SettingsHubPrefNavigationCard
        href="/settings/notifications"
        title="Notifications"
        description="Configure alerts for queue updates and court assignments"
        icon={<Bell className="w-6 h-6 text-primary" />}
      />
    </div>
  );
}
