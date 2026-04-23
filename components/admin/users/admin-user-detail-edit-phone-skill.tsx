import { AdminUserDetailPhoneField } from "@/components/admin/users/admin-user-detail-phone-field";
import { AdminUserDetailSkillSelect } from "@/components/admin/users/admin-user-detail-skill-select";

import type { AdminUserDetailFormData } from "@/lib/hooks/admin-user-detail-form-types";
import type { Dispatch, SetStateAction } from "react";

type SetForm = Dispatch<SetStateAction<AdminUserDetailFormData>>;

export function AdminUserDetailEditPhoneSkill({
  formData,
  setFormData,
}: {
  formData: AdminUserDetailFormData;
  setFormData: SetForm;
}) {
  return (
    <>
      <AdminUserDetailPhoneField formData={formData} setFormData={setFormData} />
      <AdminUserDetailSkillSelect
        value={formData.skill_level}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, skill_level: value }))
        }
      />
    </>
  );
}
