"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import {
  toastConfirmDeleteUser,
  toastConfirmToggleAdmin,
} from "@/lib/hooks/admin-users-confirm-toasts";

import type { AdminUserDetailRecord } from "@/lib/admin/fetch-admin-user-by-id";

export function useAdminUserDetailMutations(
  user: AdminUserDetailRecord,
  refresh: () => void,
) {
  const router = useRouter();
  const handleToggleAdmin = useCallback(() => {
    toastConfirmToggleAdmin(user.id, !user.is_admin, refresh);
  }, [user.id, user.is_admin, refresh]);

  const handleDelete = useCallback(() => {
    toastConfirmDeleteUser(user.id, user.name, () => {
      router.push("/admin/users");
    });
  }, [user.id, user.name, router]);

  return { handleToggleAdmin, handleDelete };
}
