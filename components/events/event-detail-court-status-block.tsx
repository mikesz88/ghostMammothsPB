import { CourtStatus } from "@/components/court-status";

import type { CourtAssignment, Event } from "@/lib/types";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

export function EventDetailCourtStatusBlock({
  event,
  assignments,
  user,
  isAdmin,
  onCompleteGame,
}: {
  event: Event;
  assignments: CourtAssignment[];
  user: SupabaseAuthUser | null;
  isAdmin: boolean;
  onCompleteGame: (assignmentId: string, team: "team1" | "team2") => void;
}) {
  return (
    <CourtStatus
      courtCount={event.courtCount}
      assignments={assignments}
      teamSize={event.teamSize}
      currentUserId={user?.id}
      isAdmin={isAdmin}
      onCompleteGame={onCompleteGame}
    />
  );
}
