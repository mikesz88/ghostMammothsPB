import { Badge } from "@/components/ui/badge";

import type { AdminUsersListRow } from "@/lib/admin/fetch-admin-users-list";

export function AdminUserCardRegularBadges({
  user,
}: {
  user: AdminUsersListRow;
}) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <p className="font-medium text-foreground">{user.name}</p>
      <Badge variant="outline" className="text-xs">
        {user.skill_level}
      </Badge>
      {user.membership_status && user.membership_status !== "free" ? (
        <Badge variant="secondary" className="text-xs">
          {user.membership_status}
        </Badge>
      ) : null}
    </div>
  );
}
