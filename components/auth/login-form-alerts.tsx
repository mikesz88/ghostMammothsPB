import { LoginErrorWithResend } from "@/components/auth/login-error-with-resend";
import { LoginUrlMessageBanner } from "@/components/auth/login-url-message-banner";

type Props = {
  message: string | null;
  error: string | null;
  isEmailNotConfirmed: boolean;
  resendLoading: boolean;
  resendMessage: string | null;
  onResendVerification: () => void;
};

export function LoginFormAlerts(props: Props) {
  return (
    <>
      <LoginUrlMessageBanner message={props.message} />
      <LoginErrorWithResend
        error={props.error}
        isEmailNotConfirmed={props.isEmailNotConfirmed}
        resendLoading={props.resendLoading}
        resendMessage={props.resendMessage}
        onResendVerification={props.onResendVerification}
      />
    </>
  );
}
