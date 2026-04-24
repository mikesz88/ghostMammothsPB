import "server-only";

import { revalidatePath } from "next/cache";

import {
  is2Stay2OffRotation,
  is2Stay2OffValidTeamSize,
} from "@/lib/rotation-policy";
import { createClient } from "@/lib/supabase/server";

import type { RotationType, TeamSize } from "@/lib/types";

function parseCreateEventForm(formData: FormData) {
  return {
    teamSize: parseInt(formData.get("team_size") as string, 10),
    rotationType: formData.get("rotation_type") as string,
    name: formData.get("name") as string,
    location: formData.get("location") as string,
    date: formData.get("date") as string,
    court_count: parseInt(formData.get("court_count") as string, 10),
  };
}

async function insertParsedEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  parsed: ReturnType<typeof parseCreateEventForm>,
) {
  const eventData = {
    name: parsed.name,
    location: parsed.location,
    date: parsed.date,
    court_count: parsed.court_count,
    team_size: parsed.teamSize,
    rotation_type: parsed.rotationType,
    status: "active",
  };
  return supabase.from("events").insert(eventData).select().single();
}

export async function runCreateEventFromFormData(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const parsed = parseCreateEventForm(formData);
  if (
    is2Stay2OffRotation(parsed.rotationType as RotationType) &&
    !is2Stay2OffValidTeamSize(parsed.teamSize as TeamSize)
  ) {
    return { error: "2 Stay 2 Off requires doubles (team size 2)." };
  }
  const { data, error } = await insertParsedEvent(supabase, parsed);
  if (error) {
    console.error("Error creating event:", error);
    return { error: error.message };
  }
  revalidatePath("/admin");
  revalidatePath("/events");
  return { data, error: null };
}
