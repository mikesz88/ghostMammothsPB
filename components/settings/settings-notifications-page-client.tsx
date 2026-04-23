"use client";

import { SettingsNotificationsPageMain } from "@/components/settings/settings-notifications-page-main";
import { SettingsNotificationsPageShell } from "@/components/settings/settings-notifications-page-shell";
import { useSettingsNotificationsForm } from "@/lib/hooks/use-settings-notifications-form";

import type { SettingsNotificationsPageClientProps } from "@/lib/settings/settings-notifications-page-types";

export function SettingsNotificationsPageClient({
  email,
}: SettingsNotificationsPageClientProps) {
  const { settings, handleToggle, handleSave } =
    useSettingsNotificationsForm(email);

  return (
    <SettingsNotificationsPageShell>
      <SettingsNotificationsPageMain
        settings={settings}
        onToggle={handleToggle}
        onSave={handleSave}
      />
    </SettingsNotificationsPageShell>
  );
}
