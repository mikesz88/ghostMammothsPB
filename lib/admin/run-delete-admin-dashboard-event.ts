import "server-only";

import type { AdminServiceDb } from "@/lib/admin/require-admin-service-db";

async function deleteDependentRows(
  db: AdminServiceDb,
  table:
    | "queue_entries"
    | "court_pending_stayers"
    | "court_assignments"
    | "event_registrations",
  eventId: string,
): Promise<string | null> {
  const { error } = await db.from(table).delete().eq("event_id", eventId);
  return error?.message ?? null;
}

async function deleteEventRow(
  db: AdminServiceDb,
  eventId: string,
): Promise<string | null> {
  const { error } = await db.from("events").delete().eq("id", eventId);
  if (!error) return null;
  console.error("deleteAdminDashboardEvent events:", error);
  return error.message;
}

export async function runDeleteAdminDashboardEvent(
  db: AdminServiceDb,
  eventId: string,
): Promise<string | null> {
  const tables = [
    "queue_entries",
    "court_pending_stayers",
    "court_assignments",
    "event_registrations",
  ] as const;
  for (const table of tables) {
    const msg = await deleteDependentRows(db, table, eventId);
    if (msg) return msg;
  }
  return deleteEventRow(db, eventId);
}
