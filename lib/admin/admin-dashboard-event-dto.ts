import type { Event, EventStatus, RotationType, TeamSize } from "@/lib/types";
import type { Database } from "@/supabase/supa-schema";

export type AdminDashboardEventRow =
  Database["public"]["Tables"]["events"]["Row"];

export type AdminDashboardInitialEvent = {
  id: string;
  name: string;
  location: string;
  dateIso: string;
  courtCount: number;
  teamSize: TeamSize;
  rotationType: RotationType;
  status: EventStatus;
  createdAtIso: string;
};

export function mapEventRowToAdminDashboardInitialEvent(
  row: AdminDashboardEventRow,
): AdminDashboardInitialEvent {
  const dateIso =
    row.date && row.time ? `${row.date}T${row.time}` : row.date;
  const courtCount =
    Number.parseInt(String(row.court_count), 10) ||
    Number.parseInt(row.num_courts, 10) ||
    0;
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    dateIso,
    courtCount,
    teamSize: (row.team_size as TeamSize) || 2,
    rotationType: row.rotation_type as RotationType,
    status: row.status as EventStatus,
    createdAtIso: row.created_at,
  };
}

export function adminDashboardInitialEventToEvent(
  row: AdminDashboardInitialEvent,
): Event {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    date: new Date(row.dateIso),
    courtCount: row.courtCount,
    teamSize: row.teamSize,
    rotationType: row.rotationType,
    status: row.status,
    createdAt: new Date(row.createdAtIso),
    updatedAt: undefined,
  };
}
