"use client";

import { useCallback } from "react";

import {
  toastConfirmDeleteUser,
  toastConfirmToggleAdmin,
} from "@/lib/hooks/admin-users-confirm-toasts";

export function useAdminUsersMutations(refreshFromServer: () => void) {
  const handleToggleAdmin = useCallback(
    (userId: string, currentStatus: boolean) => {
      toastConfirmToggleAdmin(userId, !currentStatus, refreshFromServer);
    },
    [refreshFromServer],
  );

  const handleDeleteUser = useCallback(
    (userId: string, userName: string) => {
      toastConfirmDeleteUser(userId, userName, refreshFromServer);
    },
    [refreshFromServer],
  );

  return { handleToggleAdmin, handleDeleteUser };
}
