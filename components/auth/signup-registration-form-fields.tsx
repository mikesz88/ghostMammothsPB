import { FormErrorCallout } from "@/components/auth/form-error-callout";
import { SignupBasicFields } from "@/components/auth/signup-basic-fields";
import { SignupPasswordFields } from "@/components/auth/signup-password-fields";
import { Button } from "@/components/ui/button";

import type { UseSignupRegistrationFormReturn } from "@/lib/hooks/use-signup-registration-form";

type Props = {
  f: UseSignupRegistrationFormReturn;
};

export function SignupRegistrationFormFields({ f }: Props) {
  return (
    <form onSubmit={f.handleSubmit} className="space-y-4">
      <FormErrorCallout message={f.error} />
      <SignupBasicFields formData={f.formData} onChange={f.handleInputChange} />
      <SignupPasswordFields
        formData={f.formData}
        showPassword={f.showPassword}
        showConfirmPassword={f.showConfirmPassword}
        onChange={f.handleInputChange}
        onTogglePassword={() => f.setShowPassword(!f.showPassword)}
        onToggleConfirm={() => f.setShowConfirmPassword(!f.showConfirmPassword)}
      />
      <Button type="submit" className="w-full" disabled={f.loading}>
        {f.loading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
}


