"use client";

import { useEffect, useState } from "react";

export function useEventQueueLink(eventId: string): string {
  const [queueLink, setQueueLink] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const link = `${window.location.origin}/events/${eventId}`;
    queueMicrotask(() => setQueueLink(link));
  }, [eventId]);

  return queueLink;
}
