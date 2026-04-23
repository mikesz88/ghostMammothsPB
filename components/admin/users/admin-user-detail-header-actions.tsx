import { Trash2 } from "lucide-react";

import { AdminUserDetailToggleAdminButton } from "@/components/admin/users/admin-user-detail-toggle-admin-button";
import { Button } from "@/components/ui/button";

import type { AdminUserDetailRecord } from "@/lib/admin/fetch-admin-user-by-id";

export function AdminUserDetailHeaderActions({
  user,
  onToggleAdmin,
  onDelete,
}: {
  user: AdminUserDetailRecord;
  onToggleAdmin: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex gap-2">
      <AdminUserDetailToggleAdminButton user={user} onClick={onToggleAdmin} />
      <Button variant="destructive" onClick={onDelete}>
        <Trash2 className="w-4 h-4 mr-2" />
        Delete User
      </Button>
    </div>
  );
}
