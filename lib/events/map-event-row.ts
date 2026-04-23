import type { Event } from "@/lib/types";

/** Map a Supabase `events` row to domain `Event` (same shape as former client `page.tsx`). */
export function mapEventRowToEvent(data: {
  id: string;
  name: string;
  location: string;
  date: string;
  time?: string | null;
  court_count?: number | null;
  num_courts?: string | null;
  team_size?: number | null;
  rotation_type: string;
  status: string;
  created_at: string;
  updated_at?: string | null;
}): Event {
  return {
    id: data.id,
    name: data.name,
    location: data.location,
    date:
      data.date && data.time
        ? new Date(`${data.date}T${data.time}`)
        : new Date(data.date),
    time: data.time ?? undefined,
    numCourts: data.num_courts ?? undefined,
    courtCount:
      parseInt(String(data.court_count), 10) ||
      parseInt(String(data.num_courts), 10) ||
      0,
    teamSize: (data.team_size || 2) as Event["teamSize"],
    rotationType: data.rotation_type as Event["rotationType"],
    status: data.status as Event["status"],
    createdAt: new Date(data.created_at),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
  };
}
