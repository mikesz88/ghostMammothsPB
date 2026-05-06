"use client";

import { useMemo } from "react";

import {
  derivePlayingAndCounts,
  deriveUserQueueFields,
} from "@/lib/hooks/event-detail-queue-derived-logic";

import type { CourtAssignment, Event, QueueEntry } from "@/lib/types";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

export function useEventDetailQueueDerived(
  queue: QueueEntry[],
  user: SupabaseAuthUser | null,
  assignments: CourtAssignment[],
  event: Event,
) {
  return useMemo(() => {
    const uq = deriveUserQueueFields(queue, user);
    const pc = derivePlayingAndCounts(user, assignments, queue, event);
    return { ...uq, ...pc };
  }, [queue, user, assignments, event]);
}
