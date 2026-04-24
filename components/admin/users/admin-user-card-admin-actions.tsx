import { ShieldOff, Edit } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import type { AdminUsersListRow } from "@/lib/admin/fetch-admin-users-list";

type AdminUserCardAdminActionsProps = {
  user: AdminUsersListRow;
  onRemoveAdmin: (userId: string, isAdmin: boolean) => void;
};

export function AdminUserCardAdminActions({
  user,
  onRemoveAdmin,
}: AdminUserCardAdminActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/users/${user.id}`}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Link>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onRemoveAdmin(user.id, user.is_admin)}
      >
        <ShieldOff className="w-4 h-4 mr-2" />
        Remove Admin
      </Button>
    </div>
  );
}
