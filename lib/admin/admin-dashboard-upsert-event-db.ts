import "server-only";

import {
  is2Stay2OffRotation,
  is2Stay2OffValidTeamSize,
} from "@/lib/rotation-policy";

import type { AdminDashboardEventUpsertPayload } from "@/lib/admin/admin-dashboard-event-upsert";
import type { AdminServiceDb } from "@/lib/admin/require-admin-service-db";

function rotationPolicyError(
  payload: AdminDashboardEventUpsertPayload,
): string | null {
  if (
    is2Stay2OffRotation(payload.rotationType) &&
    !is2Stay2OffValidTeamSize(payload.teamSize)
  ) {
    return "2 Stay 2 Off requires doubles (team size 2).";
  }
  return null;
}

function payloadToRow(payload: AdminDashboardEventUpsertPayload) {
  return {
    name: payload.name,
    location: payload.location,
    date: payload.date,
    time: payload.time,
    num_courts: payload.courtCount.toString(),
    court_count: payload.courtCount,
    team_size: payload.teamSize,
    rotation_type: payload.rotationType,
    status: payload.status,
  };
}

export async function adminDbInsertDashboardEvent(
  db: AdminServiceDb,
  payload: AdminDashboardEventUpsertPayload,
): Promise<string | null> {
  const policyErr = rotationPolicyError(payload);
  if (policyErr) return policyErr;
  const { error } = await db.from("events").insert(payloadToRow(payload));
  if (!error) return null;
  console.error("createAdminDashboardEvent:", error);
  return error.message;
}

export async function adminDbUpdateDashboardEvent(
  db: AdminServiceDb,
  eventId: string,
  payload: AdminDashboardEventUpsertPayload,
): Promise<string | null> {
  const policyErr = rotationPolicyError(payload);
  if (policyErr) return policyErr;
  const { error } = await db
    .from("events")
    .update(payloadToRow(payload))
    .eq("id", eventId);
  if (!error) return null;
  console.error("updateAdminDashboardEvent:", error);
  return error.message;
}
