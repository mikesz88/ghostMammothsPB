import { SettingsHubPageClient } from "@/components/settings/settings-hub-page-client";
import { loadSettingsHubPageData } from "@/lib/settings/load-settings-hub-page-data";

export default async function SettingsPage() {
  const { session, userDetails, membership } = await loadSettingsHubPageData();
  return (
    <SettingsHubPageClient
      session={session}
      userDetails={userDetails}
      membership={membership}
    />
  );
}
