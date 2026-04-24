import { Users } from "lucide-react";

import { AdminUserCardRegularBadges } from "@/components/admin/users/admin-user-card-regular-badges";

import type { AdminUsersListRow } from "@/lib/admin/fetch-admin-users-list";

export function AdminUserCardRegularInfo({ user }: { user: AdminUsersListRow }) {
  return (
    <div className="flex items-center gap-4 flex-1">
      <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
        <Users className="w-6 h-6 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <AdminUserCardRegularBadges user={user} />
        <p className="text-sm text-muted-foreground">{user.email}</p>
        {user.phone ? (
          <p className="text-sm text-muted-foreground">{user.phone}</p>
        ) : null}
        <p className="text-xs text-muted-foreground mt-1">
          Joined {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
