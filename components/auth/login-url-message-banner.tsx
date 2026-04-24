type Props = {
  message: string | null;
};

export function LoginUrlMessageBanner({ message }: Props) {
  if (!message) {
    return null;
  }
  return (
    <div className="p-3 text-sm text-blue-700 bg-blue-50 dark:text-blue-200 dark:bg-blue-950 rounded-md">
      {message}
    </div>
  );
}
