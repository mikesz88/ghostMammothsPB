import { AdminQueueEmptyCard } from "@/components/admin/events/admin-queue-empty-card";
import { QueueList } from "@/components/queue-list";

import type { QueueEntry } from "@/lib/types";

export function AdminQueueListSection({
  queue,
  onRemoveEntry,
}: {
  queue: QueueEntry[];
  onRemoveEntry: (entryId: string) => void | Promise<void>;
}) {
  if (queue.length === 0) return <AdminQueueEmptyCard />;
  return (
    <QueueList
      queue={queue}
      onRemove={onRemoveEntry}
      currentUserId=""
      isAdmin={true}
    />
  );
}
