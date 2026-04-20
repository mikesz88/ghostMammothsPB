"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { RotationType, TeamSize } from "@/lib/types";
import {
  is2Stay2OffRotation,
  is2Stay2OffValidTeamSize,
} from "@/lib/rotation-policy";

export async function getEvents() {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("events")
    .select(
      `
      *,
      queue_entries!inner(count),
      court_assignments!inner(count)
    `
    )
    .eq("status", "active")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return { events: [], error };
  }

  return { events: events || [], error: null };
}

export async function getEvent(id: string) {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching event:", error);
    return { event: null, error };
  }

  return { event, error: null };
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const teamSize = parseInt(formData.get("team_size") as string, 10);
  const rotationType = formData.get("rotation_type") as string;

  if (
    is2Stay2OffRotation(rotationType as RotationType) &&
    !is2Stay2OffValidTeamSize(teamSize as TeamSize)
  ) {
    return {
      error: "2 Stay 2 Off requires doubles (team size 2).",
    };
  }

  const eventData = {
    name: formData.get("name") as string,
    location: formData.get("location") as string,
    date: formData.get("date") as string,
    court_count: parseInt(formData.get("court_count") as string, 10),
    team_size: teamSize,
    rotation_type: rotationType,
    status: "active",
  };

  const { data, error } = await supabase
    .from("events")
    .insert(eventData)
    .select()
    .single();

  if (error) {
    console.error("Error creating event:", error);
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/events");
  return { data, error: null };
}
