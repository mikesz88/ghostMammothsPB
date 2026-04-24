type Props = {
  resendMessage: string | null;
};

export function LoginResendOutcome({ resendMessage }: Props) {
  if (!resendMessage) {
    return null;
  }
  return (
    <div
      className={`p-3 text-sm rounded-md ${
        resendMessage.startsWith("Verification")
          ? "text-green-700 bg-green-50 dark:text-green-200 dark:bg-green-950"
          : "text-destructive-foreground bg-destructive/20"
      }`}
    >
      {resendMessage}
    </div>
  );
}
