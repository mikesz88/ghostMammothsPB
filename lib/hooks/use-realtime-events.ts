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
        setEvents(data || []);
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
