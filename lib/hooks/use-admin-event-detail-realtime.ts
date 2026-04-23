"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";

import {
  ADMIN_COURT_ASSIGNMENTS_SELECT,
  mapAdminCourtAssignmentRows,
  type AdminCourtAssignmentWithPlayers,
} from "@/lib/admin/map-admin-court-assignments";
import { adminQueueQueryKey } from "@/lib/admin-queue";
import { createClient } from "@/lib/supabase/client";

import type { CourtAssignment } from "@/lib/types";
import type { QueryClient } from "@tanstack/react-query";

export function useAdminEventDetailRealtime(
  eventId: string,
  queryClient: QueryClient,
  setAssignments: Dispatch<SetStateAction<CourtAssignment[]>>,
) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`admin-queue-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue_entries",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: adminQueueQueryKey(eventId),
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, queryClient]);

  useEffect(() => {
    const fetchAssignments = async () => {
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
          mapAdminCourtAssignmentRows(
            data as AdminCourtAssignmentWithPlayers[],
          ),
        );
      }
    };

    void fetchAssignments();

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
          void fetchAssignments();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, setAssignments]);
}
