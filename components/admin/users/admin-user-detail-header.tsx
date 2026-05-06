import { AdminUserDetailHeaderActions } from "@/components/admin/users/admin-user-detail-header-actions";
import { AdminUserDetailHeaderTitle } from "@/components/admin/users/admin-user-detail-header-title";

import type { AdminUserDetailRecord } from "@/lib/admin/fetch-admin-user-by-id";

type AdminUserDetailHeaderProps = {
  user: AdminUserDetailRecord;
  onToggleAdmin: () => void;
  onDelete: () => void;
};

export function AdminUserDetailHeader({
  user,
  onToggleAdmin,
  onDelete,
}: AdminUserDetailHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <AdminUserDetailHeaderTitle user={user} />
      <AdminUserDetailHeaderActions
        user={user}
        onToggleAdmin={onToggleAdmin}
        onDelete={onDelete}
      />
    </div>
  );
}
