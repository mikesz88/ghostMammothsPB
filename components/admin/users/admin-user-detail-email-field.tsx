import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { AdminUserDetailFormData } from "@/lib/hooks/admin-user-detail-form-types";
import type { Dispatch, SetStateAction } from "react";

type SetForm = Dispatch<SetStateAction<AdminUserDetailFormData>>;

export function AdminUserDetailEmailField({
  formData,
  setFormData,
}: {
  formData: AdminUserDetailFormData;
  setFormData: SetForm;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        value={formData.email}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, email: e.target.value }))
        }
        placeholder="email@example.com"
      />
    </div>
  );
}
