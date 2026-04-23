"use client";

import { useEffect, useState } from "react";

import { hydrateSerializedAssignments } from "@/lib/events/hydrate-event-detail";
import {
  COURT_ASSIGNMENTS_NESTED_SELECT,
  mapCourtAssignmentRows,
} from "@/lib/events/map-court-assignments";
import { createClient } from "@/lib/supabase/client";

import type { EventDetailSerializedAssignment } from "@/lib/events/event-detail-server";
import type { CourtAssignment } from "@/lib/types";

export function useCourtAssignmentsRealtime(
  eventId: string,
  initialAssignments: EventDetailSerializedAssignment[],
): CourtAssignment[] {
  const [assignments, setAssignments] = useState<CourtAssignment[]>(() =>
    hydrateSerializedAssignments(initialAssignments),
  );

  useEffect(() => {
    const fetchAssignments = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("court_assignments")
        .select(COURT_ASSIGNMENTS_NESTED_SELECT)
        .eq("event_id", eventId)
        .is("ended_at", null);

      if (error) {
        console.error("Error fetching assignments:", error);
        return;
      }
      if (data) {
        setAssignments(
          mapCourtAssignmentRows(data as Record<string, unknown>[]),
        );
        return;
      }
      setAssignments([]);
    };

    fetchAssignments();

    const supabase = createClient();
    const channel = supabase
      .channel(`public-assignments-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "court_assignments",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchAssignments();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  return assignments;
}
