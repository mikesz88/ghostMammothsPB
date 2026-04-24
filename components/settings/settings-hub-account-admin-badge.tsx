import { Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { SettingsHubUsersRow } from "@/lib/settings/settings-hub-page-types";

export function SettingsHubAccountAdminBadge({
  userDetails,
}: {
  userDetails: SettingsHubUsersRow | null;
}) {
  if (!userDetails?.is_admin) return null;
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">Role</p>
      <Badge variant="default">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    </div>
  );
}
