import { AdminUsersAdminSection } from "@/components/admin/users/admin-users-admin-section";
import { AdminUsersRegularSection } from "@/components/admin/users/admin-users-regular-section";

import type { AdminUsersListRow } from "@/lib/admin/fetch-admin-users-list";

type AdminUsersPageListsColumnProps = {
  adminUsers: AdminUsersListRow[];
  regularUsers: AdminUsersListRow[];
  onToggleAdmin: (userId: string, isAdmin: boolean) => void;
  onDelete: (userId: string, userName: string) => void;
};

export function AdminUsersPageListsColumn({
  adminUsers,
  regularUsers,
  onToggleAdmin,
  onDelete,
}: AdminUsersPageListsColumnProps) {
  return (
    <>
      <AdminUsersAdminSection
        adminUsers={adminUsers}
        onToggleAdmin={onToggleAdmin}
      />
      <AdminUsersRegularSection
        regularUsers={regularUsers}
        onToggleAdmin={onToggleAdmin}
        onDelete={onDelete}
      />
    </>
  );
}
