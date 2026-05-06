import { CourtStatus } from "@/components/court-status";

import type { CourtAssignment, Event } from "@/lib/types";

export function AdminEventCourtsPanel({
  event,
  assignments,
  onCompleteGame,
}: {
  event: Pick<Event, "courtCount" | "teamSize">;
  assignments: CourtAssignment[];
  onCompleteGame: (
    assignmentId: string,
    winningTeam: "team1" | "team2",
  ) => void | Promise<void>;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">Courts</h2>
      <CourtStatus
        assignments={assignments}
        courtCount={event.courtCount}
        teamSize={event.teamSize}
        isAdmin={true}
        onCompleteGame={onCompleteGame}
      />
    </div>
  );
}
