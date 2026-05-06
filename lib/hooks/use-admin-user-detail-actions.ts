"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useAdminUserDetailMutations } from "@/lib/hooks/use-admin-user-detail-mutations";
import { useAdminUserDetailSaveAction } from "@/lib/hooks/use-admin-user-detail-save-action";

import type { AdminUserDetailRecord } from "@/lib/admin/fetch-admin-user-by-id";
import type { AdminUserDetailFormData } from "@/lib/hooks/admin-user-detail-form-types";

export type { AdminUserDetailFormData };

export type AdminUserDetailActionsReturn = {
  saving: boolean;
  handleSave: (formData: AdminUserDetailFormData) => Promise<void>;
  handleToggleAdmin: () => void;
  handleDelete: () => void;
};

export function useAdminUserDetailActions(
  user: AdminUserDetailRecord,
): AdminUserDetailActionsReturn {
  const router = useRouter();
  const refresh = useCallback(() => router.refresh(), [router]);
  const { saving, handleSave } = useAdminUserDetailSaveAction(user, refresh);
  const { handleToggleAdmin, handleDelete } = useAdminUserDetailMutations(
    user,
    refresh,
  );
  return { saving, handleSave, handleToggleAdmin, handleDelete };
}
