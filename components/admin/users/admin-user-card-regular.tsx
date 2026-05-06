import { AdminUserCardRegularActions } from "@/components/admin/users/admin-user-card-regular-actions";
import { AdminUserCardRegularInfo } from "@/components/admin/users/admin-user-card-regular-info";
import { Card, CardContent } from "@/components/ui/card";

import type { AdminUsersListRow } from "@/lib/admin/fetch-admin-users-list";

type AdminUserCardRegularProps = {
  user: AdminUsersListRow;
  onMakeAdmin: (userId: string, isAdmin: boolean) => void;
  onDelete: (userId: string, userName: string) => void;
};

export function AdminUserCardRegular({
  user,
  onMakeAdmin,
  onDelete,
}: AdminUserCardRegularProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <AdminUserCardRegularInfo user={user} />
          <AdminUserCardRegularActions
            user={user}
            onMakeAdmin={onMakeAdmin}
            onDelete={onDelete}
          />
        </div>
      </CardContent>
    </Card>
  );
}
