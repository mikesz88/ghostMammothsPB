"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Event } from "../types";

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
        const eventsWithDates = (data || []).map((event: any) => ({
          ...event,
          date:
            event.date && event.time
              ? new Date(`${event.date}T${event.time}`)
              : new Date(event.date),
          courtCount:
            parseInt(event.court_count) || parseInt(event.num_courts) || 0,
          teamSize: event.team_size || 2,
          rotationType: event.rotation_type,
          createdAt: new Date(event.created_at),
          updatedAt: event.updated_at ? new Date(event.updated_at) : new Date(),
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
