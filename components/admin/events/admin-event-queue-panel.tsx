import { Play, Trash2, Users } from "lucide-react";

import { QueueList } from "@/components/queue-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { QueueEntry } from "@/lib/types";

export function AdminEventQueuePanel({
  waitingCount,
  queue,
  onAssignNext,
  onClearQueue,
  onRemoveEntry,
}: {
  waitingCount: number;
  queue: QueueEntry[];
  onAssignNext: () => void | Promise<void>;
  onClearQueue: () => void | Promise<void>;
  onRemoveEntry: (entryId: string) => void | Promise<void>;
}) {
  const estWaitMinutes =
    waitingCount > 0 ? Math.ceil((waitingCount / 4) * 15) : 0;

  return (
    <div>
      <Card className="border-border mb-4">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">
                {waitingCount}
              </p>
              <p className="text-sm text-muted-foreground">In Queue</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">
                {Math.ceil(waitingCount / 4)}
              </p>
              <p className="text-sm text-muted-foreground">Full Games</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">
                {estWaitMinutes}m
              </p>
              <p className="text-sm text-muted-foreground">Est. Wait</p>
            </div>
          </div>
        </CardContent>
      </Card>

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

      <h2 className="text-2xl font-bold text-foreground mb-4">Queue</h2>
      {queue.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No players in queue</p>
          </CardContent>
        </Card>
      ) : (
        <QueueList
          queue={queue}
          onRemove={onRemoveEntry}
          currentUserId=""
          isAdmin={true}
        />
      )}
    </div>
  );
}
