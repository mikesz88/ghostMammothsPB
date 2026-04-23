import type {
  Event,
  EventStatus,
  RotationType,
  TeamSize,
} from "@/lib/types";

/** Same event date/fields mapping as the former client `admin/events/[id]/page.tsx`. */
export function mapAdminEventRowToEvent(data: {
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
}): Event {
  const eventDate = new Date(data.date);
  if (data.time) {
    const timeParts = data.time.split(":");
    eventDate.setHours(
      parseInt(timeParts[0], 10),
      parseInt(timeParts[1], 10),
    );
  }

  return {
    id: data.id,
    name: data.name,
    location: data.location,
    date: eventDate,
    courtCount:
      parseInt(String(data.court_count), 10) ||
      parseInt(String(data.num_courts), 10) ||
      0,
    teamSize: (data.team_size || 2) as TeamSize,
    rotationType: data.rotation_type as RotationType,
    status: data.status as EventStatus,
    createdAt: new Date(data.created_at),
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
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
