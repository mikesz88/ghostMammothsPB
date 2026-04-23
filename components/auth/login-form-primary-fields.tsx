import { LoginEmailField } from "@/components/auth/login-email-field";
import { LoginFormAlerts } from "@/components/auth/login-form-alerts";
import { LoginPasswordField } from "@/components/auth/login-password-field";

import type { UseLoginFormReturn } from "@/lib/hooks/use-login-form";

type Props = {
  f: UseLoginFormReturn;
};

export function LoginFormPrimaryFields({ f }: Props) {
  return (
    <>
      <LoginFormAlerts
        message={f.message}
        error={f.error}
        isEmailNotConfirmed={f.isEmailNotConfirmed}
        resendLoading={f.resendLoading}
        resendMessage={f.resendMessage}
        onResendVerification={f.onResendVerification}
      />
      <LoginEmailField email={f.email} onEmailChange={f.setEmail} />
      <LoginPasswordField
        password={f.password}
        showPassword={f.showPassword}
        onPasswordChange={f.setPassword}
        onToggleShowPassword={() => f.setShowPassword(!f.showPassword)}
      />
    </>
  );
}
