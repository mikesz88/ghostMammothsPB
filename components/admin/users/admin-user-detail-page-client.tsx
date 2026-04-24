"use client";

import { AdminUserDetailPageShell } from "@/components/admin/users/admin-user-detail-page-shell";
import { useAdminUserDetailActions } from "@/lib/hooks/use-admin-user-detail-actions";

import type { AdminUserDetailRecord } from "@/lib/admin/fetch-admin-user-by-id";

function adminUserDetailFormKey(user: AdminUserDetailRecord) {
  return [
    user.name,
    user.email,
    user.phone ?? "",
    user.skill_level,
    String(user.is_admin),
  ].join("|");
}

export function AdminUserDetailPageClient({
  initialUser,
}: {
  initialUser: AdminUserDetailRecord;
}) {
  const actions = useAdminUserDetailActions(initialUser);
  return (
    <AdminUserDetailPageShell
      initialUser={initialUser}
      formKey={adminUserDetailFormKey(initialUser)}
      defaultForm={{
        name: initialUser.name,
        email: initialUser.email,
        phone: initialUser.phone || "",
        skill_level: initialUser.skill_level,
      }}
      actions={actions}
    />
  );
}
