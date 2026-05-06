import { EventDetailQueueLoading } from "@/components/events/event-detail/event-detail-queue-loading";
import { QueueList } from "@/components/queue/queue-list";

import type { QueueEntry } from "@/lib/types";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

export type EventDetailQueueListSectionProps = {
  queue: QueueEntry[];
  queueLoading: boolean;
  user: SupabaseAuthUser | null;
  isAdmin: boolean;
  onQueueRemove: (entryId: string) => void | Promise<void>;
  leavingQueueEntryIds?: string[];
};

export function EventDetailQueueListSection(p: EventDetailQueueListSectionProps) {
  if (p.queueLoading) return <EventDetailQueueLoading />;
  return (
    <QueueList
      queue={p.queue}
      onRemove={p.onQueueRemove}
      currentUserId={p.user?.id ?? ""}
      isAdmin={p.isAdmin}
      leavingQueueEntryIds={p.leavingQueueEntryIds}
    />
  );
}
