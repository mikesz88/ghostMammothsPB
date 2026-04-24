"use client";

import { useAuth } from "@/lib/auth-context";
import { useEventDetailAccessSync } from "@/lib/hooks/use-event-detail-access-sync";
import { useEventDetailClientDialogs } from "@/lib/hooks/use-event-detail-client-dialogs";
import { useEventDetailClientQueueSession } from "@/lib/hooks/use-event-detail-client-queue-session";

import type { EventDetailAccess } from "@/lib/events/event-detail-server";

export function useEventDetailClientSession(
  eventId: string,
  initialAccess: EventDetailAccess,
  initialIsAdmin: boolean,
) {
  const d = useEventDetailClientDialogs();
  const { user } = useAuth();
  const q = useEventDetailClientQueueSession(eventId);
  const access = useEventDetailAccessSync(
    user,
    eventId,
    initialAccess,
    initialIsAdmin,
  );
  return { ...d, user, ...q, ...access };
}
