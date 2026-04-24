import { LoginResendOutcome } from "@/components/auth/login-resend-outcome";
import { Button } from "@/components/ui/button";

type Props = {
  resendLoading: boolean;
  resendMessage: string | null;
  onResendVerification: () => void;
};

export function LoginResendVerificationBlock({
  resendLoading,
  resendMessage,
  onResendVerification,
}: Props) {
  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onResendVerification}
        disabled={resendLoading}
      >
        {resendLoading ? "Sending..." : "Resend verification email"}
      </Button>
      <LoginResendOutcome resendMessage={resendMessage} />
    </div>
  );
}

