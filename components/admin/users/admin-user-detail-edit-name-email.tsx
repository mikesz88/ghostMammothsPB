import { AdminUserDetailEmailField } from "@/components/admin/users/admin-user-detail-email-field";
import { AdminUserDetailNameField } from "@/components/admin/users/admin-user-detail-name-field";

import type { AdminUserDetailFormData } from "@/lib/hooks/admin-user-detail-form-types";
import type { Dispatch, SetStateAction } from "react";

type SetForm = Dispatch<SetStateAction<AdminUserDetailFormData>>;

export function AdminUserDetailEditNameEmail({
  formData,
  setFormData,
}: {
  formData: AdminUserDetailFormData;
  setFormData: SetForm;
}) {
  return (
    <>
      <AdminUserDetailNameField formData={formData} setFormData={setFormData} />
      <AdminUserDetailEmailField formData={formData} setFormData={setFormData} />
    </>
  );
}
