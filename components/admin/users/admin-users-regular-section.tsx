import { AdminUsersRegularEmpty } from "@/components/admin/users/admin-users-regular-empty";
import { AdminUsersRegularList } from "@/components/admin/users/admin-users-regular-list";

import type { AdminUsersListRow } from "@/lib/admin/fetch-admin-users-list";

type AdminUsersRegularSectionProps = {
  regularUsers: AdminUsersListRow[];
  onToggleAdmin: (userId: string, isAdmin: boolean) => void;
  onDelete: (userId: string, userName: string) => void;
};

export function AdminUsersRegularSection({
  regularUsers,
  onToggleAdmin,
  onDelete,
}: AdminUsersRegularSectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Regular Users ({regularUsers.length})
      </h2>
      {regularUsers.length === 0 ? (
        <AdminUsersRegularEmpty />
      ) : (
        <AdminUsersRegularList
          regularUsers={regularUsers}
          onToggleAdmin={onToggleAdmin}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
