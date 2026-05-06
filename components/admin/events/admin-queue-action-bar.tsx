import { Play, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminQueueActionBar({
  onAssignNext,
  onClearQueue,
}: {
  onAssignNext: () => void | Promise<void>;
  onClearQueue: () => void | Promise<void>;
}) {
  return (
    <div className="flex gap-2 mb-4">
      <Button onClick={onAssignNext} size="lg" className="flex-1">
        <Play className="w-4 h-4 mr-2" />
        Assign Next Players
      </Button>
      <Button onClick={onClearQueue} size="lg" variant="destructive">
        <Trash2 className="w-4 h-4 mr-2" />
        Clear Queue
      </Button>
    </div>
  );
}
