import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { AdminUserDetailFormData } from "@/lib/hooks/admin-user-detail-form-types";
import type { Dispatch, SetStateAction } from "react";

type SetForm = Dispatch<SetStateAction<AdminUserDetailFormData>>;

export function AdminUserDetailNameField({
  formData,
  setFormData,
}: {
  formData: AdminUserDetailFormData;
  setFormData: SetForm;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="name">Name</Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, name: e.target.value }))
        }
        placeholder="Full name"
      />
    </div>
  );
}
