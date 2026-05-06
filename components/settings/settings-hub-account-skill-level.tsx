import { Badge } from "@/components/ui/badge";

import type { SettingsHubUsersRow } from "@/lib/settings/settings-hub-page-types";

export function SettingsHubAccountSkillLevel({
  userDetails,
}: {
  userDetails: SettingsHubUsersRow | null;
}) {
  if (!userDetails?.skill_level) return null;
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">Skill Level</p>
      <Badge variant="secondary">
        {userDetails.skill_level.charAt(0).toUpperCase() +
          userDetails.skill_level.slice(1)}
      </Badge>
    </div>
  );
}
