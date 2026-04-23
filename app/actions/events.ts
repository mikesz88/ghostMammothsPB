"use server";

import { revalidatePath } from "next/cache";

import {
  is2Stay2OffRotation,
  is2Stay2OffValidTeamSize,
} from "@/lib/rotation-policy";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

import type { RotationType, TeamSize } from "@/lib/types";
import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceDb = SupabaseClient<Database>;

async function requireAdminServiceDb(): Promise<
  | { db: ServiceDb; error: null }
  | { db: null; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { db: null, error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { db: null, error: "Unauthorized - Admin access required" };
  }

  const db = createServiceRoleClient();
  if (!db) {
    console.error("requireAdminServiceDb: SUPABASE_SERVICE_ROLE_KEY missing");
    return { db: null, error: "Server configuration error" };
  }

  return { db, error: null };
}

/** Clear live state and mark event ended (admin dashboard). Uses service role after is_admin check — browser RLS often blocks `events` updates. */
export async function endAdminDashboardEvent(eventId: string) {
  const gate = await requireAdminServiceDb();
  if (gate.error || !gate.db) {
    return {
      success: false as const,
      error: gate.error ?? "Server configuration error",
    };
  }
  const { db } = gate;

  const { error: queueError } = await db
    .from("queue_entries")
    .delete()
    .eq("event_id", eventId);

  if (queueError) {
    console.error("endAdminDashboardEvent queue_entries:", queueError);
    return { success: false as const, error: queueError.message };
  }

  const { error: pendingError } = await db
    .from("court_pending_stayers")
    .delete()
    .eq("event_id", eventId);

  if (pendingError) {
    console.error("endAdminDashboardEvent court_pending_stayers:", pendingError);
    return { success: false as const, error: pendingError.message };
  }

  const { error: assignmentsError } = await db
    .from("court_assignments")
    .delete()
    .eq("event_id", eventId);

  if (assignmentsError) {
    console.error("endAdminDashboardEvent court_assignments:", assignmentsError);
    return { success: false as const, error: assignmentsError.message };
  }

  const { error: eventError } = await db
    .from("events")
    .update({ status: "ended" })
    .eq("id", eventId);

  if (eventError) {
    console.error("endAdminDashboardEvent events:", eventError);
    return { success: false as const, error: eventError.message };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");

  return { success: true as const, error: null as null };
}

/** Hard-delete event and dependent rows (admin dashboard). */
export async function deleteAdminDashboardEvent(eventId: string) {
  const gate = await requireAdminServiceDb();
  if (gate.error || !gate.db) {
    return {
      success: false as const,
      error: gate.error ?? "Server configuration error",
    };
  }
  const { db } = gate;

  const { error: queueError } = await db
    .from("queue_entries")
    .delete()
    .eq("event_id", eventId);

  if (queueError) {
    return { success: false as const, error: queueError.message };
  }

  const { error: pendingError } = await db
    .from("court_pending_stayers")
    .delete()
    .eq("event_id", eventId);

  if (pendingError) {
    return { success: false as const, error: pendingError.message };
  }

  const { error: assignmentsError } = await db
    .from("court_assignments")
    .delete()
    .eq("event_id", eventId);

  if (assignmentsError) {
    return { success: false as const, error: assignmentsError.message };
  }

  const { error: regError } = await db
    .from("event_registrations")
    .delete()
    .eq("event_id", eventId);

  if (regError) {
    return { success: false as const, error: regError.message };
  }

  const { error: deleteError } = await db
    .from("events")
    .delete()
    .eq("id", eventId);

  if (deleteError) {
    console.error("deleteAdminDashboardEvent events:", deleteError);
    return { success: false as const, error: deleteError.message };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");

  return { success: true as const, error: null as null };
}

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
