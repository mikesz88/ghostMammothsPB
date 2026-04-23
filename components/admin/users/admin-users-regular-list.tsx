import { AdminUserCardRegular } from "@/components/admin/users/admin-user-card-regular";

import type { AdminUsersListRow } from "@/lib/admin/fetch-admin-users-list";

type AdminUsersRegularListProps = {
  regularUsers: AdminUsersListRow[];
  onToggleAdmin: (userId: string, isAdmin: boolean) => void;
  onDelete: (userId: string, userName: string) => void;
};

export function AdminUsersRegularList({
  regularUsers,
  onToggleAdmin,
  onDelete,
}: AdminUsersRegularListProps) {
  return (
    <div className="space-y-3">
      {regularUsers.map((user) => (
        <AdminUserCardRegular
          key={user.id}
          user={user}
          onMakeAdmin={onToggleAdmin}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
