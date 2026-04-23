import { EventDetailQueueLoading } from "@/components/events/event-detail-queue-loading";
import { QueueList } from "@/components/queue-list";

import type { QueueEntry } from "@/lib/types";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

export function EventDetailQueueListSection({
  queue,
  queueLoading,
  user,
  isAdmin,
  onQueueRemove,
}: {
  queue: QueueEntry[];
  queueLoading: boolean;
  user: SupabaseAuthUser | null;
  isAdmin: boolean;
  onQueueRemove: (entryId: string) => void | Promise<void>;
}) {
  if (queueLoading) return <EventDetailQueueLoading />;
  return (
    <QueueList
      queue={queue}
      onRemove={onQueueRemove}
      currentUserId={user?.id || ""}
      isAdmin={isAdmin}
    />
  );
}
