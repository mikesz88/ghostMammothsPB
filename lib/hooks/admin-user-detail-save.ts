"use client";

import { toast } from "sonner";

import { updateUser } from "@/app/actions/admin-users";

import type { AdminUserDetailFormData } from "@/lib/hooks/admin-user-detail-form-types";

export async function runAdminUserDetailSave(
  userId: string,
  formData: AdminUserDetailFormData,
  refresh: () => void,
) {
  const { error } = await updateUser(userId, {
    name: formData.name,
    email: formData.email,
    phone: formData.phone || undefined,
    skill_level: formData.skill_level,
  });
  if (error) {
    toast.error("Failed to update user", { description: error });
    return;
  }
  toast.success("User updated successfully!");
  refresh();
}
