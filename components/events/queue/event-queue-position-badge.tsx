import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";

function queuePositionBadgeLabel(
  userPosition: number,
  isPendingStay: boolean,
  isPendingSolo: boolean,
): string {
  if (isPendingStay) {
    return "On deck for next game";
  }
  if (isPendingSolo) {
    return `Waiting for more solos (#${userPosition})`;
  }
  return `You're #${userPosition}`;
}

export function EventQueuePositionBadge({
  userPosition,
  isPendingStay,
  isPendingSolo,
}: {
  userPosition: number;
  isPendingStay: boolean;
  isPendingSolo: boolean;
}) {
  return (
    <Badge variant="default" className="text-sm">
      <Bell className="w-3 h-3 mr-1" />
      {queuePositionBadgeLabel(userPosition, isPendingStay, isPendingSolo)}
    </Badge>
  );
}
