
import { AdminUserDetailEditNameEmail } from "@/components/admin/users/admin-user-detail-edit-name-email";
import { AdminUserDetailEditPhoneSkill } from "@/components/admin/users/admin-user-detail-edit-phone-skill";

import type { AdminUserDetailFormData } from "@/lib/hooks/use-admin-user-detail-actions";
import type { Dispatch, SetStateAction } from "react";

type SetForm = Dispatch<SetStateAction<AdminUserDetailFormData>>;

export function AdminUserDetailEditFormFields({
  formData,
  setFormData,
}: {
  formData: AdminUserDetailFormData;
  setFormData: SetForm;
}) {
  return (
    <>
      <AdminUserDetailEditNameEmail
        formData={formData}
        setFormData={setFormData}
      />
      <AdminUserDetailEditPhoneSkill
        formData={formData}
        setFormData={setFormData}
      />
    </>
  );
}
