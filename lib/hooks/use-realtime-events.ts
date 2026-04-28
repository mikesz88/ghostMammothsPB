"use client";

import { useEffect, useState } from "react";

import { eventRowToEvent } from "@/lib/events/event-row-to-domain";
import { hydrateSerializedEvent } from "@/lib/events/hydrate-event-detail";
import { createClient } from "@/lib/supabase/client";

import type { Event } from "../types";
import type { EventDetailSerializedEvent } from "@/lib/events/event-detail-server";

export function useRealtimeEvents(
  initialSerializedEvents?: EventDetailSerializedEvent[],
) {
  const seededFromServer = initialSerializedEvents !== undefined;

  const [events, setEvents] = useState<Event[]>(() =>
    initialSerializedEvents === undefined
      ? []
      : initialSerializedEvents.map(hydrateSerializedEvent),
  );
  const [loading, setLoading] = useState(
    () => initialSerializedEvents === undefined,
  );

  useEffect(() => {
    const supabase = createClient();

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "active")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents((data ?? []).map(eventRowToEvent));
      }
      setLoading(false);
    };

    if (!seededFromServer) {
      void fetchEvents();
    }

    const channel = supabase
      .channel("events")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        () => {
          void fetchEvents();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [seededFromServer]);

  return { events, loading };
}
