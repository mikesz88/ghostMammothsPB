import { SettingsNotificationsPageClient } from "@/components/settings/settings-notifications-page-client";
import { loadSettingsNotificationsPageData } from "@/lib/settings/load-settings-notifications-page-data";

export default async function NotificationSettingsPage() {
  const { email } = await loadSettingsNotificationsPageData();
  return <SettingsNotificationsPageClient email={email} />;
}
