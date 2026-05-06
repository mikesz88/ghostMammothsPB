type Props = {
  error: string | null;
};

export function LoginErrorBanner({ error }: Props) {
  if (!error) {
    return null;
  }
  return (
    <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">
      {error}
    </div>
  );
}
