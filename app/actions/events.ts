"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

  const eventData = {
    name: formData.get("name") as string,
    location: formData.get("location") as string,
    date: formData.get("date") as string,
    time: "00:00:00", // Default time if not provided
    court_count: parseInt(formData.get("court_count") as string),
    num_courts: formData.get("court_count") as string,
    team_size: parseInt(formData.get("team_size") as string),
    rotation_type: formData.get("rotation_type") as string,
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
