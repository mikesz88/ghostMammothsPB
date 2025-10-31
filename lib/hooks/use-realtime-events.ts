"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Event, TeamSize, RotationType, EventStatus } from "../types";
import type { Database } from "@/supabase/supa-schema";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

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
        const eventsWithDates = (data || []).map((event: EventRow) => ({
          id: event.id,
          name: event.name,
          location: event.location,
          date:
            event.date && event.time
              ? new Date(`${event.date}T${event.time}`)
              : new Date(event.date),
          courtCount:
            parseInt(event.court_count.toString()) || parseInt(event.num_courts) || 0,
          teamSize: (event.team_size || 2) as TeamSize,
          rotationType: event.rotation_type as RotationType,
          status: event.status as EventStatus,
          createdAt: new Date(event.created_at),
          updatedAt: event.updated_at ? new Date(event.updated_at) : undefined,
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
