import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { AdminUserDetailFormData } from "@/lib/hooks/admin-user-detail-form-types";
import type { Dispatch, SetStateAction } from "react";

type SetForm = Dispatch<SetStateAction<AdminUserDetailFormData>>;

export function AdminUserDetailPhoneField({
  formData,
  setFormData,
}: {
  formData: AdminUserDetailFormData;
  setFormData: SetForm;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="phone">Phone (Optional)</Label>
      <Input
        id="phone"
        type="tel"
        value={formData.phone}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, phone: e.target.value }))
        }
        placeholder="(555) 123-4567"
      />
    </div>
  );
}
