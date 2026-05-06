import { SignupFullNameField } from "@/components/auth/signup-full-name-field";
import { SignupRegisterEmailField } from "@/components/auth/signup-register-email-field";

import type { SignupRegistrationFields } from "@/lib/auth/submit-signup-registration";

type Props = {
  formData: SignupRegistrationFields;
  onChange: (field: keyof SignupRegistrationFields, value: string) => void;
};

export function SignupNameEmailFields({ formData, onChange }: Props) {
  return (
    <>
      <SignupFullNameField name={formData.name} onChange={onChange} />
      <SignupRegisterEmailField email={formData.email} onChange={onChange} />
    </>
  );
}

