"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import type {
  Event,
  EventStatus,
  RotationType,
  TeamSize,
} from "../types";
import type { Database } from "@/supabase/supa-schema";


type EventRow = Database["public"]["Tables"]["events"]["Row"];

export function useRealtimeEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

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
        const eventsWithDates: Event[] = (data || []).map((event: EventRow) => ({
          id: event.id,
          name: event.name,
          location: event.location,
          date:
            event.date && event.time
              ? new Date(`${event.date}T${event.time}`)
              : new Date(event.date),
          time: event.time,
          numCourts: event.num_courts,
          courtCount:
            event.court_count ||
            Number.parseInt(event.num_courts, 10) ||
            0,
          teamSize: (event.team_size || 2) as TeamSize,
          rotationType: event.rotation_type as RotationType,
          status: event.status as EventStatus,
          createdAt: new Date(event.created_at),
        }));
        setEvents(eventsWithDates);
      }
      setLoading(false);
    };

    fetchEvents();

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
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { events, loading };
}
