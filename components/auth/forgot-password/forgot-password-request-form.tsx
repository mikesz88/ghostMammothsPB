import { ForgotPasswordEmailInput } from "@/components/auth/forgot-password/forgot-password-email-input";
import { ForgotPasswordRequestActions } from "@/components/auth/forgot-password/forgot-password-request-actions";
import { FormErrorCallout } from "@/components/auth/shared/form-error-callout";

type Props = {
  email: string;
  loading: boolean;
  error: string | null;
  onEmailChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function ForgotPasswordRequestForm({
  email,
  loading,
  error,
  onEmailChange,
  onSubmit,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormErrorCallout message={error} />
      <ForgotPasswordEmailInput email={email} onEmailChange={onEmailChange} />
      <ForgotPasswordRequestActions loading={loading} />
    </form>
  );
}

