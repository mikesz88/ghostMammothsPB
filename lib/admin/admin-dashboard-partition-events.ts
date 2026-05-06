import type { Event } from "@/lib/types";

export function partitionAdminDashboardEvents(events: Event[]) {
  const activeEvents = events.filter((e) => e.status === "active");
  const endedEvents = events.filter((e) => e.status === "ended");
  const totalCourts = activeEvents.reduce((sum, e) => sum + e.courtCount, 0);
  return { activeEvents, endedEvents, totalCourts };
}
