import type { Event, EventStatus, RotationType, TeamSize } from "@/lib/types";

export type AdminDashboardEventUpsertPayload = {
  name: string;
  location: string;
  date: string;
  time: string;
  courtCount: number;
  teamSize: TeamSize;
  rotationType: RotationType;
  status: EventStatus;
};

export function adminDashboardUpsertPayloadFromEventForm(
  eventData: Omit<Event, "id" | "createdAt" | "updatedAt">,
): AdminDashboardEventUpsertPayload {
  const eventDateTime = new Date(eventData.date);
  const date = eventDateTime.toISOString().split("T")[0];
  const time = eventDateTime.toTimeString().split(" ")[0];
  return {
    name: eventData.name,
    location: eventData.location,
    date,
    time,
    courtCount: eventData.courtCount,
    teamSize: eventData.teamSize,
    rotationType: eventData.rotationType,
    status: eventData.status,
  };
}
