import "server-only";

import type { AdminServiceDb } from "@/lib/admin/require-admin-service-db";

async function deleteEventScopedRows(
  db: AdminServiceDb,
  table: "queue_entries" | "court_pending_stayers" | "court_assignments",
  eventId: string,
  logLabel: string,
): Promise<string | null> {
  const { error } = await db.from(table).delete().eq("event_id", eventId);
  if (!error) return null;
  console.error(`${logLabel}:`, error);
  return error.message;
}

async function markEventEndedDb(
  db: AdminServiceDb,
  eventId: string,
): Promise<string | null> {
  const { error } = await db
    .from("events")
    .update({ status: "ended" })
    .eq("id", eventId);
  if (!error) return null;
  console.error("endAdminDashboardEvent events:", error);
  return error.message;
}

export async function runEndAdminDashboardEvent(
  db: AdminServiceDb,
  eventId: string,
): Promise<string | null> {
  const steps = [
    ["queue_entries", "endAdminDashboardEvent queue_entries"],
    ["court_pending_stayers", "endAdminDashboardEvent court_pending_stayers"],
    ["court_assignments", "endAdminDashboardEvent court_assignments"],
  ] as const;
  for (const [table, label] of steps) {
    const err = await deleteEventScopedRows(db, table, eventId, label);
    if (err) return err;
  }
  return markEventEndedDb(db, eventId);
}
