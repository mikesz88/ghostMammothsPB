"use client";

import { AdminUserDetailPageBody } from "@/components/admin/users/admin-user-detail-page-body";
import { Header } from "@/components/ui/header";

import type { AdminUserDetailRecord } from "@/lib/admin/fetch-admin-user-by-id";
import type {
  AdminUserDetailActionsReturn,
  AdminUserDetailFormData,
} from "@/lib/hooks/use-admin-user-detail-actions";


type AdminUserDetailPageShellProps = {
  initialUser: AdminUserDetailRecord;
  formKey: string;
  defaultForm: AdminUserDetailFormData;
  actions: AdminUserDetailActionsReturn;
};

export function AdminUserDetailPageShell({
  initialUser,
  formKey,
  defaultForm,
  actions,
}: AdminUserDetailPageShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header
        variant="admin"
        backButton={{ href: "/admin/users", label: "Back to Users" }}
      />
      <AdminUserDetailPageBody
        user={initialUser}
        formKey={formKey}
        defaultForm={defaultForm}
        saving={actions.saving}
        onSave={(fd) => void actions.handleSave(fd)}
        onToggleAdmin={actions.handleToggleAdmin}
        onDelete={actions.handleDelete}
      />
    </div>
  );
}
