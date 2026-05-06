import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AdminDashboardEndedEventCardToolbar({
  eventId,
  onDelete,
}: {
  eventId: string;
  onDelete: (eventId: string) => void;
}) {
  return (
    <div className="flex items-start justify-between mb-2">
      <Badge variant="secondary">Ended</Badge>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(eventId)}
        aria-label="Delete ended event"
      >
        <Trash2 className="w-4 h-4" aria-hidden />
      </Button>
    </div>
  );
}
