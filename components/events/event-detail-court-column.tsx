import { EventDetailCourtHeading } from "@/components/events/event-detail-court-heading";
import { EventDetailCourtStatusBlock } from "@/components/events/event-detail-court-status-block";

import type { CourtAssignment, Event } from "@/lib/types";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

export function EventDetailCourtColumn(p: {
  event: Event;
  assignments: CourtAssignment[];
  user: SupabaseAuthUser | null;
  isAdmin: boolean;
  onCompleteGame: (assignmentId: string, team: "team1" | "team2") => void;
}) {
  return (
    <div>
      <EventDetailCourtHeading event={p.event} />
      <EventDetailCourtStatusBlock {...p} />
    </div>
  );
}
