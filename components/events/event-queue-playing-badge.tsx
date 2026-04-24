import { Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function EventQueuePlayingBadge() {
  return (
    <Badge variant="default" className="text-sm">
      <Trophy className="w-3 h-3 mr-1" />
      Currently Playing
    </Badge>
  );
}
