"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useAdminUsersListFilter } from "@/lib/hooks/use-admin-users-list-filter";
import { useAdminUsersMutations } from "@/lib/hooks/use-admin-users-mutations";

import type { AdminUsersListRow } from "@/lib/admin/fetch-admin-users-list";

export function useAdminUsersPage(initialUsers: AdminUsersListRow[]) {
  const router = useRouter();
  const refreshFromServer = useCallback(() => {
    router.refresh();
  }, [router]);

  const list = useAdminUsersListFilter(initialUsers);
  const { handleToggleAdmin, handleDeleteUser } =
    useAdminUsersMutations(refreshFromServer);

  return {
    ...list,
    handleToggleAdmin,
    handleDeleteUser,
  };
}
