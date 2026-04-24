import { Shield, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import type { AdminUsersListRow } from "@/lib/admin/fetch-admin-users-list";

type AdminUserCardRegularActionsProps = {
  user: AdminUsersListRow;
  onMakeAdmin: (userId: string, isAdmin: boolean) => void;
  onDelete: (userId: string, userName: string) => void;
};

export function AdminUserCardRegularActions({
  user,
  onMakeAdmin,
  onDelete,
}: AdminUserCardRegularActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/users/${user.id}`}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Link>
      </Button>
      <Button variant="outline" size="sm" onClick={() => onMakeAdmin(user.id, user.is_admin)}>
        <Shield className="w-4 h-4 mr-2" />
        Make Admin
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onDelete(user.id, user.name)}>
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  );
}
