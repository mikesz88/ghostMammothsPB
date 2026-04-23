import { LoginErrorBanner } from "@/components/auth/login-error-banner";
import { LoginResendVerificationBlock } from "@/components/auth/login-resend-verification-block";

type Props = {
  error: string | null;
  isEmailNotConfirmed: boolean;
  resendLoading: boolean;
  resendMessage: string | null;
  onResendVerification: () => void;
};

export function LoginErrorWithResend({
  error,
  isEmailNotConfirmed,
  resendLoading,
  resendMessage,
  onResendVerification,
}: Props) {
  if (!error) {
    return null;
  }
  return (
    <div className="space-y-2">
      <LoginErrorBanner error={error} />
      {isEmailNotConfirmed ? (
        <LoginResendVerificationBlock
          resendLoading={resendLoading}
          resendMessage={resendMessage}
          onResendVerification={onResendVerification}
        />
      ) : null}
    </div>
  );
}

