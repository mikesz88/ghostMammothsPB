import { Loader2 } from "lucide-react";

export function EventDetailQueueLoading() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span className="ml-2 text-muted-foreground">Loading queue...</span>
    </div>
  );
}
