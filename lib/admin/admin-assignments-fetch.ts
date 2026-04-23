"use client";

import {
  ADMIN_COURT_ASSIGNMENTS_SELECT,
  mapAdminCourtAssignmentRows,
  type AdminCourtAssignmentWithPlayers,
} from "@/lib/admin/map-admin-court-assignments";
import { createClient } from "@/lib/supabase/client";

import type { CourtAssignment } from "@/lib/types";
import type { Dispatch, SetStateAction } from "react";

export async function fetchAndSetAdminCourtAssignments(
  eventId: string,
  setAssignments: Dispatch<SetStateAction<CourtAssignment[]>>,
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("court_assignments")
    .select(ADMIN_COURT_ASSIGNMENTS_SELECT)
    .eq("event_id", eventId)
    .order("court_number");

  if (error) {
    console.error("Error fetching assignments:", error);
    return;
  }
  if (data) {
    setAssignments(
      mapAdminCourtAssignmentRows(data as AdminCourtAssignmentWithPlayers[]),
    );
  }
}
