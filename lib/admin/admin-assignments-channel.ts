"use client";

import { fetchAndSetAdminCourtAssignments } from "@/lib/admin/admin-assignments-fetch";
import { createClient } from "@/lib/supabase/client";

import type { CourtAssignment } from "@/lib/types";
import type { Dispatch, SetStateAction } from "react";

export function subscribeAdminCourtAssignments(
  eventId: string,
  setAssignments: Dispatch<SetStateAction<CourtAssignment[]>>,
) {
  const supabase = createClient();
  const channel = supabase
    .channel(`admin-assignments-${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "court_assignments",
        filter: `event_id=eq.${eventId}`,
      },
      () => {
        void fetchAndSetAdminCourtAssignments(eventId, setAssignments);
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
