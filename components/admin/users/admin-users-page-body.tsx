import { AdminUsersPageListsColumn } from "@/components/admin/users/admin-users-page-lists-column";
import { AdminUsersPageTopBlock } from "@/components/admin/users/admin-users-page-top-block";

import type { AdminUsersListRow } from "@/lib/admin/fetch-admin-users-list";

export type AdminUsersPageBodyProps = {
  users: AdminUsersListRow[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  adminUsers: AdminUsersListRow[];
  regularUsers: AdminUsersListRow[];
  freeMembersCount: number;
  handleToggleAdmin: (userId: string, isAdmin: boolean) => void;
  handleDeleteUser: (userId: string, userName: string) => void;
};

export function AdminUsersPageBody(p: AdminUsersPageBodyProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <AdminUsersPageTopBlock
        users={p.users}
        searchQuery={p.searchQuery}
        setSearchQuery={p.setSearchQuery}
        adminUsers={p.adminUsers}
        regularUsers={p.regularUsers}
        freeMembersCount={p.freeMembersCount}
      />
      <AdminUsersPageListsColumn
        adminUsers={p.adminUsers}
        regularUsers={p.regularUsers}
        onToggleAdmin={p.handleToggleAdmin}
        onDelete={p.handleDeleteUser}
      />
    </div>
  );
}
