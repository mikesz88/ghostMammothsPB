import { AdminUserDetailEditForm } from "@/components/admin/users/admin-user-detail-edit-form";
import { AdminUserDetailHeader } from "@/components/admin/users/admin-user-detail-header";
import { AdminUserDetailRecentActivityCard } from "@/components/admin/users/admin-user-detail-recent-activity-card";
import { AdminUserDetailSidebar } from "@/components/admin/users/admin-user-detail-sidebar";

import type { AdminUserDetailRecord } from "@/lib/admin/fetch-admin-user-by-id";
import type { AdminUserDetailFormData } from "@/lib/hooks/use-admin-user-detail-actions";

type AdminUserDetailPageBodyProps = {
  user: AdminUserDetailRecord;
  formKey: string;
  defaultForm: AdminUserDetailFormData;
  saving: boolean;
  onSave: (formData: AdminUserDetailFormData) => void;
  onToggleAdmin: () => void;
  onDelete: () => void;
};

export function AdminUserDetailPageBody(p: AdminUserDetailPageBodyProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <AdminUserDetailHeader
          user={p.user}
          onToggleAdmin={p.onToggleAdmin}
          onDelete={p.onDelete}
        />
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <AdminUserDetailEditForm
            key={p.formKey}
            defaultForm={p.defaultForm}
            saving={p.saving}
            onSave={p.onSave}
          />
          <AdminUserDetailSidebar user={p.user} />
        </div>
        <AdminUserDetailRecentActivityCard />
      </div>
    </div>
  );
}
