import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

export function MembershipMarketingTiersLoadError({
  message,
}: {
  message: string | null;
}) {
  if (!message) return null;
  return (
    <Alert variant="destructive" className="mb-8 max-w-3xl mx-auto">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Could not load membership plans: {message}
      </AlertDescription>
    </Alert>
  );
}
