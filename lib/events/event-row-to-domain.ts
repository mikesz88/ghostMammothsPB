import type { Event, EventStatus, RotationType, TeamSize } from "@/lib/types";
import type { Database } from "@/supabase/supa-schema";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

/** Map a Supabase `events` row to domain `Event` (shared by client fetch + server list load). */
export function eventRowToEvent(event: EventRow): Event {
  return {
    id: event.id,
    name: event.name,
    location: event.location,
    date:
      event.date && event.time
        ? new Date(`${event.date}T${event.time}`)
        : new Date(event.date),
    time: event.time ?? undefined,
    numCourts: event.num_courts ?? undefined,
    courtCount:
      event.court_count ||
      Number.parseInt(String(event.num_courts ?? ""), 10) ||
      0,
    teamSize: (event.team_size || 2) as TeamSize,
    rotationType: event.rotation_type as RotationType,
    status: event.status as EventStatus,
    createdAt: new Date(event.created_at),
  };
}
