"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getQueue(eventId: string) {
  const supabase = await createClient();

  const { data: queue, error } = await supabase
    .from("queue_entries")
    .select(
      `
      *,
      user:users(*)
    `
    )
    .eq("event_id", eventId)
    .eq("status", "waiting")
    .order("position");

  if (error) {
    console.error("Error fetching queue:", error);
    return { queue: [], error };
  }

  return { queue: queue || [], error: null };
}

export async function joinQueue(
  eventId: string,
  userId: string,
  groupSize: number,
  groupId?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return { error: "Not authenticated" };
  }

  // Get current queue length to determine position
  const { data: currentQueue } = await supabase
    .from("queue_entries")
    .select("position")
    .eq("event_id", eventId)
    .eq("status", "waiting")
    .order("position", { ascending: false })
    .limit(1);

  const position = currentQueue?.[0]?.position
    ? currentQueue[0].position + 1
    : 1;

  const { data, error } = await supabase
    .from("queue_entries")
    .insert({
      event_id: eventId,
      user_id: userId,
      group_id: groupId,
      group_size: groupSize,
      position: position,
      status: "waiting",
    })
    .select()
    .single();

  if (error) {
    console.error("Error joining queue:", error);
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}`);
  return { data, error: null };
}

export async function leaveQueue(queueEntryId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get the queue entry to verify ownership
  const { data: entry } = await supabase
    .from("queue_entries")
    .select("*")
    .eq("id", queueEntryId)
    .single();

  if (!entry || entry.user_id !== user.id) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("queue_entries")
    .delete()
    .eq("id", queueEntryId);

  if (error) {
    console.error("Error leaving queue:", error);
    return { error: error.message };
  }

  // Reorder remaining queue positions
  await reorderQueue(entry.event_id);

  revalidatePath(`/events/${entry.event_id}`);
  return { error: null };
}

export async function reorderQueue(eventId: string) {
  const supabase = await createClient();

  const { data: queue } = await supabase
    .from("queue_entries")
    .select("*")
    .eq("event_id", eventId)
    .eq("status", "waiting")
    .order("joined_at");

  if (queue) {
    // Update positions
    for (let i = 0; i < queue.length; i++) {
      await supabase
        .from("queue_entries")
        .update({ position: i + 1 })
        .eq("id", queue[i].id);
    }
  }
}
