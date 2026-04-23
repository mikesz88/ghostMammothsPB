"use client";


import { useAdminAssignmentsRealtime } from "@/lib/hooks/use-admin-assignments-realtime";
import { useAdminQueueInvalidateRealtime } from "@/lib/hooks/use-admin-queue-invalidate-realtime";

import type { CourtAssignment } from "@/lib/types";
import type { QueryClient } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";

export function useAdminEventDetailRealtime(
  eventId: string,
  queryClient: QueryClient,
  setAssignments: Dispatch<SetStateAction<CourtAssignment[]>>,
) {
  useAdminQueueInvalidateRealtime(eventId, queryClient);
  useAdminAssignmentsRealtime(eventId, setAssignments);
}
