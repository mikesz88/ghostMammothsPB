type Props = {
  message: string | null;
};

export function FormErrorCallout({ message }: Props) {
  if (!message) {
    return null;
  }
  return (
    <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">
      {message}
    </div>
  );
}
