import { fetchAdminEventDetailPayload } from "@/lib/admin/load-admin-event-detail-data";
import { requireAdminSession } from "@/lib/admin/require-admin-session";

import type {
  AdminSerializedCourtAssignment,
  AdminSerializedEvent,
  AdminSerializedQueueEntry,
} from "@/lib/admin/hydrate-admin-event-detail";

export type AdminEventDetailPagePayload = {
  eventId: string;
  initialEvent: AdminSerializedEvent;
  initialAssignments: AdminSerializedCourtAssignment[];
  initialQueue: AdminSerializedQueueEntry[];
  isTestEvent: boolean;
};

export async function loadAdminEventDetailPageData(
  eventId: string,
): Promise<AdminEventDetailPagePayload | null> {
  const supabase = await requireAdminSession();
  const payload = await fetchAdminEventDetailPayload(supabase, eventId);
  if (!payload) return null;
  return { eventId, ...payload };
}
