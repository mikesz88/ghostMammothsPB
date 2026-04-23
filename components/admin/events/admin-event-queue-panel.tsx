import { AdminQueueActionBar } from "@/components/admin/events/admin-queue-action-bar";
import { AdminQueueListSection } from "@/components/admin/events/admin-queue-list-section";
import { AdminQueueStatsCard } from "@/components/admin/events/admin-queue-stats-card";

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
  return (
    <div>
      <AdminQueueStatsCard waitingCount={waitingCount} />
      <AdminQueueActionBar
        onAssignNext={onAssignNext}
        onClearQueue={onClearQueue}
      />
      <h2 className="text-2xl font-bold text-foreground mb-4">Queue</h2>
      <AdminQueueListSection queue={queue} onRemoveEntry={onRemoveEntry} />
    </div>
  );
}
