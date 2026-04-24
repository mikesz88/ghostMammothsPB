import { AdminUsersPageToolbar } from "@/components/admin/users/admin-users-page-toolbar";
import { AdminUsersSearchField } from "@/components/admin/users/admin-users-search-field";
import { AdminUsersStatsCards } from "@/components/admin/users/admin-users-stats-cards";

import type { AdminUsersListRow } from "@/lib/admin/fetch-admin-users-list";

type AdminUsersPageTopBlockProps = {
  users: AdminUsersListRow[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  adminUsers: AdminUsersListRow[];
  regularUsers: AdminUsersListRow[];
  freeMembersCount: number;
};

export function AdminUsersPageTopBlock({
  users,
  searchQuery,
  setSearchQuery,
  adminUsers,
  regularUsers,
  freeMembersCount,
}: AdminUsersPageTopBlockProps) {
  return (
    <>
      <AdminUsersPageToolbar />
      <AdminUsersStatsCards
        totalUsers={users.length}
        adminCount={adminUsers.length}
        regularCount={regularUsers.length}
        freeMembersCount={freeMembersCount}
      />
      <AdminUsersSearchField value={searchQuery} onChange={setSearchQuery} />
    </>
  );
}
