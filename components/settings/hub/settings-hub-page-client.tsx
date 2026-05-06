"use client";

import { SettingsHubPageMain } from "@/components/settings/hub/settings-hub-page-main";
import { SettingsHubPageShell } from "@/components/settings/hub/settings-hub-page-shell";
import { useSettingsHubAccountDeletion } from "@/lib/hooks/settings/use-settings-hub-account-deletion";

import type { SettingsHubPageClientProps } from "@/lib/settings/settings-hub-page-types";

export function SettingsHubPageClient(props: SettingsHubPageClientProps) {
  const { deleteLoading, handleDeleteAccount } = useSettingsHubAccountDeletion();
  return (
    <SettingsHubPageShell>
      <SettingsHubPageMain
        {...props}
        deleteLoading={deleteLoading}
        onDeleteAccount={handleDeleteAccount}
      />
    </SettingsHubPageShell>
  );
}
