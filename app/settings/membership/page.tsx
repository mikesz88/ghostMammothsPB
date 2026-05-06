import { SettingsMembershipPageClient } from "@/components/settings/settings-membership-page-client";
import { loadSettingsMembershipPageData } from "@/lib/settings/load-settings-membership-page-data";

export default async function MembershipSettingsPage() {
  const { membership } = await loadSettingsMembershipPageData();
  return <SettingsMembershipPageClient membership={membership} />;
}
