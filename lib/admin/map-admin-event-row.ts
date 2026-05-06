import type {
  Event,
  EventStatus,
  RotationType,
  TeamSize,
} from "@/lib/types";

function eventDateFromRow(date: string, time?: string | null) {
  const eventDate = new Date(date);
  if (time) {
    const timeParts = time.split(":");
    eventDate.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10));
  }
  return eventDate;
}

function adminRowCourtCount(data: {
  court_count: number | string | null;
  num_courts?: string | null;
}) {
  return (
    parseInt(String(data.court_count), 10) ||
    parseInt(String(data.num_courts), 10) ||
    0
  );
}

type AdminEventRow = {
  id: string;
  name: string;
  location: string;
  date: string;
  time?: string | null;
  court_count: number | string | null;
  num_courts?: string | null;
  team_size?: number | null;
  rotation_type: string;
  status: string;
  created_at: string;
  updated_at?: string | null;
};

/** Same event date/fields mapping as the former client `admin/events/[id]/page.tsx`. */
export function mapAdminEventRowToEvent(data: AdminEventRow): Event {
  const { id, name, location, date, time, rotation_type, status, created_at, updated_at } =
    data;
  return {
    id,
    name,
    location,
    date: eventDateFromRow(date, time),
    courtCount: adminRowCourtCount(data),
    teamSize: (data.team_size || 2) as TeamSize,
    rotationType: rotation_type as RotationType,
    status: status as EventStatus,
    createdAt: new Date(created_at),
    updatedAt: updated_at ? new Date(updated_at) : undefined,
  };
}

export function adminEventNameIsTestEvent(name: string): boolean {
  const nameUpper = name.toUpperCase();
  return (
    nameUpper.includes("DEVELOPER TEST EVENT") ||
    nameUpper.includes("DYNAMIC ADMIN TEST EVENT") ||
    nameUpper.includes("TEST EVENT")
  );
}
