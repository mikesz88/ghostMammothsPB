"use client";

import { useEffect, useState } from "react";

import { hydrateSerializedAssignments } from "@/lib/events/hydrate-event-detail";
import { fetchActiveCourtAssignmentsClient } from "@/lib/hooks/court-assignments-client-fetch";
import { subscribeCourtAssignmentsChanges } from "@/lib/hooks/court-assignments-realtime-channel";
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
    const supabase = createClient();
    const load = async () => {
      const rows = await fetchActiveCourtAssignmentsClient(supabase, eventId);
      setAssignments(rows);
    };
    void load();
    const channel = subscribeCourtAssignmentsChanges(supabase, eventId, load);
    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  return assignments;
}
