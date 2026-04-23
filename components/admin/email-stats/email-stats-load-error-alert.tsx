import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function EmailStatsLoadErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTitle>Could not load email statistics</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
