import { SignupNameEmailFields } from "@/components/auth/signup-name-email-fields";
import { SignupPhoneSkillFields } from "@/components/auth/signup-phone-skill-fields";

import type { SignupRegistrationFields } from "@/lib/auth/submit-signup-registration";

type Props = {
  formData: SignupRegistrationFields;
  onChange: (field: keyof SignupRegistrationFields, value: string) => void;
};

export function SignupBasicFields({ formData, onChange }: Props) {
  return (
    <>
      <SignupNameEmailFields formData={formData} onChange={onChange} />
      <SignupPhoneSkillFields formData={formData} onChange={onChange} />
    </>
  );
}

