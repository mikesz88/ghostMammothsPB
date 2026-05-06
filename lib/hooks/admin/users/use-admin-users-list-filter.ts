"use client";

import { useEffect, useState } from "react";

import type { AdminUsersListRow } from "@/lib/admin/fetch-admin-users-list";

function filterUsersBySearch(
  users: AdminUsersListRow[],
  searchQuery: string,
): AdminUsersListRow[] {
  if (!searchQuery.trim()) return users;
  const query = searchQuery.toLowerCase();
  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.skill_level.toLowerCase().includes(query),
  );
}

export function useAdminUsersListFilter(initialUsers: AdminUsersListRow[]) {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(initialUsers);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  useEffect(() => {
    setFilteredUsers(filterUsersBySearch(users, searchQuery));
  }, [searchQuery, users]);

  const adminUsers = filteredUsers.filter((u) => u.is_admin);
  const regularUsers = filteredUsers.filter((u) => !u.is_admin);
  const freeMembersCount = users.filter(
    (u) => u.membership_status === "free" || !u.membership_status,
  ).length;

  return {
    users,
    searchQuery,
    setSearchQuery,
    adminUsers,
    regularUsers,
    freeMembersCount,
  };
}
