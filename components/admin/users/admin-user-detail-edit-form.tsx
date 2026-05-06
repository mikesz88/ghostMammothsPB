import { useState } from "react";

import { AdminUserDetailEditFormFields } from "@/components/admin/users/admin-user-detail-edit-form-fields";
import { AdminUserDetailSaveButton } from "@/components/admin/users/admin-user-detail-save-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { AdminUserDetailFormData } from "@/lib/hooks/use-admin-user-detail-actions";

type AdminUserDetailEditFormProps = {
  defaultForm: AdminUserDetailFormData;
  saving: boolean;
  onSave: (formData: AdminUserDetailFormData) => void;
};

export function AdminUserDetailEditForm({
  defaultForm,
  saving,
  onSave,
}: AdminUserDetailEditFormProps) {
  const [formData, setFormData] = useState(defaultForm);
  return (
    <Card className="border-border bg-card md:col-span-2">
      <CardHeader>
        <CardTitle className="text-foreground">User Information</CardTitle>
        <CardDescription>Update user details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AdminUserDetailEditFormFields
          formData={formData}
          setFormData={setFormData}
        />
        <AdminUserDetailSaveButton
          saving={saving}
          onClick={() => onSave(formData)}
        />
      </CardContent>
    </Card>
  );
}
