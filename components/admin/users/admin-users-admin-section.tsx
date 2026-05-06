import { AdminUserCardAdmin } from "@/components/admin/users/admin-user-card-admin";

import type { AdminUsersListRow } from "@/lib/admin/fetch-admin-users-list";

type AdminUsersAdminSectionProps = {
  adminUsers: AdminUsersListRow[];
  onToggleAdmin: (userId: string, isAdmin: boolean) => void;
};

export function AdminUsersAdminSection({
  adminUsers,
  onToggleAdmin,
}: AdminUsersAdminSectionProps) {
  if (adminUsers.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Administrators ({adminUsers.length})
      </h2>
      <div className="space-y-3">
        {adminUsers.map((user) => (
          <AdminUserCardAdmin
            key={user.id}
            user={user}
            onRemoveAdmin={onToggleAdmin}
          />
        ))}
      </div>
    </div>
  );
}
