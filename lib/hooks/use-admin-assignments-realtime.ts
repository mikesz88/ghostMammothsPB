"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";

import { subscribeAdminCourtAssignments } from "@/lib/admin/admin-assignments-channel";
import { fetchAndSetAdminCourtAssignments } from "@/lib/admin/admin-assignments-fetch";

import type { CourtAssignment } from "@/lib/types";

export function useAdminAssignmentsRealtime(
  eventId: string,
  setAssignments: Dispatch<SetStateAction<CourtAssignment[]>>,
) {
  useEffect(() => {
    void fetchAndSetAdminCourtAssignments(eventId, setAssignments);
    return subscribeAdminCourtAssignments(eventId, setAssignments);
  }, [eventId, setAssignments]);
}
