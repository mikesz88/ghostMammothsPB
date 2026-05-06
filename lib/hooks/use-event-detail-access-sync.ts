"use client";

import { useEffect, useState } from "react";

import {
  initialAccessState,
  syncEventDetailAccessState,
} from "@/lib/hooks/event-detail-access-sync-logic";

import type { EventDetailAccess } from "@/lib/events/event-detail-server";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

export function useEventDetailAccessSync(
  user: SupabaseAuthUser | null | undefined,
  eventId: string,
  initialAccess: EventDetailAccess,
  initialIsAdmin: boolean,
) {
  const [state, setState] = useState(() =>
    initialAccessState(initialAccess, initialIsAdmin),
  );
  useEffect(() => {
    void syncEventDetailAccessState(user, eventId, setState);
  }, [user, eventId]);
  return state;
}
