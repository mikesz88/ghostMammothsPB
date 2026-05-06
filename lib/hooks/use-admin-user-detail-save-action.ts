"use client";

import { useCallback, useState } from "react";

import { runAdminUserDetailSave } from "@/lib/hooks/admin-user-detail-save";

import type { AdminUserDetailRecord } from "@/lib/admin/fetch-admin-user-by-id";
import type { AdminUserDetailFormData } from "@/lib/hooks/admin-user-detail-form-types";

export function useAdminUserDetailSaveAction(
  user: AdminUserDetailRecord,
  refresh: () => void,
) {
  const [saving, setSaving] = useState(false);
  const handleSave = useCallback(
    async (formData: AdminUserDetailFormData) => {
      setSaving(true);
      try {
        await runAdminUserDetailSave(user.id, formData, refresh);
      } finally {
        setSaving(false);
      }
    },
    [user.id, refresh],
  );
  return { saving, handleSave };
}
