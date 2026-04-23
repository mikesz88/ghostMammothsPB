import { EventDetailCourtColumn } from "@/components/events/event-detail-court-column";
import { EventDetailQueueColumn } from "@/components/events/event-detail-queue-column";

import type { CourtAssignment, Event, QueueEntry } from "@/lib/types";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

export type EventDetailClientGridProps = {
  event: Event;
  assignments: CourtAssignment[];
  user: SupabaseAuthUser | null;
  queue: QueueEntry[];
  queueLoading: boolean;
  isCurrentlyPlaying: boolean;
  userPosition: number;
  isPendingStay: boolean;
  isPendingSolo: boolean;
  canJoin: boolean;
  joinReason: string | undefined;
  requiresPayment: boolean;
  paymentAmount: number | undefined;
  isAdmin: boolean;
  onJoinClick: () => void;
  onShowQrClick: () => void;
  onCompleteGame: (assignmentId: string, team: "team1" | "team2") => void;
  onQueueRemove: (entryId: string) => void | Promise<void>;
};

function EventDetailClientCourtSlot({ p }: { p: EventDetailClientGridProps }) {
  return (
    <EventDetailCourtColumn
      event={p.event}
      assignments={p.assignments}
      user={p.user}
      isAdmin={p.isAdmin}
      onCompleteGame={p.onCompleteGame}
    />
  );
}

function EventDetailClientQueueSlot({ p }: { p: EventDetailClientGridProps }) {
  return (
    <EventDetailQueueColumn
      queue={p.queue}
      queueLoading={p.queueLoading}
      user={p.user}
      isAdmin={p.isAdmin}
      isCurrentlyPlaying={p.isCurrentlyPlaying}
      userPosition={p.userPosition}
      isPendingStay={p.isPendingStay}
      isPendingSolo={p.isPendingSolo}
      canJoin={p.canJoin}
      joinReason={p.joinReason}
      requiresPayment={p.requiresPayment}
      paymentAmount={p.paymentAmount}
      onJoinClick={p.onJoinClick}
      onShowQrClick={p.onShowQrClick}
      onQueueRemove={p.onQueueRemove}
    />
  );
}

function EventDetailClientGridColumns({ p }: { p: EventDetailClientGridProps }) {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <EventDetailClientCourtSlot p={p} />
      <EventDetailClientQueueSlot p={p} />
    </div>
  );
}

export function EventDetailClientGrid(p: EventDetailClientGridProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <EventDetailClientGridColumns p={p} />
    </div>
  );
}
