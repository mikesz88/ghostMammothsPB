import { Shield } from "lucide-react";

import { AdminUserCardAdminActions } from "@/components/admin/users/admin-user-card-admin-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import type { AdminUsersListRow } from "@/lib/admin/fetch-admin-users-list";

function AdminUserCardAdminBody({ user }: { user: AdminUsersListRow }) {
  return (
    <div className="flex items-center gap-4 flex-1">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
        <Shield className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-foreground">{user.name}</p>
          <Badge variant="default" className="text-xs">
            Admin
          </Badge>
          <Badge variant="outline" className="text-xs">
            {user.skill_level}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        {user.phone ? (
          <p className="text-sm text-muted-foreground">{user.phone}</p>
        ) : null}
      </div>
    </div>
  );
}

type AdminUserCardAdminProps = {
  user: AdminUsersListRow;
  onRemoveAdmin: (userId: string, isAdmin: boolean) => void;
};

export function AdminUserCardAdmin({
  user,
  onRemoveAdmin,
}: AdminUserCardAdminProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <AdminUserCardAdminBody user={user} />
          <AdminUserCardAdminActions user={user} onRemoveAdmin={onRemoveAdmin} />
        </div>
      </CardContent>
    </Card>
  );
}
