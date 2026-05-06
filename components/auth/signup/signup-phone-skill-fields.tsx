import { SignupPhoneField } from "@/components/auth/signup/signup-phone-field";
import { SignupSkillLevelSelect } from "@/components/auth/signup/signup-skill-level-select";

import type { SignupRegistrationFields } from "@/lib/auth/submit-signup-registration";

type Props = {
  formData: SignupRegistrationFields;
  onChange: (field: keyof SignupRegistrationFields, value: string) => void;
};

export function SignupPhoneSkillFields({ formData, onChange }: Props) {
  return (
    <>
      <SignupPhoneField phone={formData.phone} onChange={onChange} />
      <SignupSkillLevelSelect
        skillLevel={formData.skillLevel}
        onChange={onChange}
      />
    </>
  );
}

