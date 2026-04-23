import { FormErrorCallout } from "@/components/auth/form-error-callout";
import { ResetPasswordConfirmField } from "@/components/auth/reset-password-confirm-field";
import { ResetPasswordNewField } from "@/components/auth/reset-password-new-field";
import { Button } from "@/components/ui/button";

import type { UseResetPasswordFormReturn } from "@/lib/hooks/use-reset-password-form";

type Props = {
  f: UseResetPasswordFormReturn;
};

export function ResetPasswordFormFields({ f }: Props) {
  return (
    <form onSubmit={f.handleSubmit} className="space-y-4">
      <FormErrorCallout message={f.error} />
      <ResetPasswordNewField
        password={f.password}
        showPassword={f.showPassword}
        onPasswordChange={f.setPassword}
        onToggleShow={() => f.setShowPassword(!f.showPassword)}
      />
      <ResetPasswordConfirmField
        confirmPassword={f.confirmPassword}
        showConfirmPassword={f.showConfirmPassword}
        onConfirmChange={f.setConfirmPassword}
        onToggleShow={() =>
          f.setShowConfirmPassword(!f.showConfirmPassword)
        }
      />
      <Button type="submit" className="w-full" disabled={f.loading}>
        {f.loading ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
