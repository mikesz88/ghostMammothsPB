"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Event } from "../types";

export function useRealtimeEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "active")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        // Convert date strings to Date objects and map snake_case to camelCase
        const eventsWithDates = (data || []).map((event: any) => ({
          ...event,
          date:
            event.date && event.time
              ? new Date(`${event.date}T${event.time}`)
              : new Date(event.date),
          courtCount:
            parseInt(event.court_count) || parseInt(event.num_courts) || 0,
          rotationType: event.rotation_type,
          createdAt: new Date(event.created_at),
          updatedAt: event.updated_at ? new Date(event.updated_at) : new Date(),
        }));
        setEvents(eventsWithDates);
      }
      setLoading(false);
    };

    fetchEvents();

    // Subscribe to real-time changes
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
          // Refetch on any change
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return { events, loading };
}
