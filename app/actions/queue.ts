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

export async function adminRemoveFromQueue(
  queueEntryId: string,
  reason?: string
) {
  console.log("🔍 [ADMIN REMOVE] Starting adminRemoveFromQueue with:", {
    queueEntryId,
    reason,
  });

  const supabase = await createClient();

  // Verify admin
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log("🔍 [ADMIN REMOVE] Auth result:", {
    userId: user?.id,
    userEmail: user?.email,
    authError,
  });

  if (!user) {
    console.log("❌ [ADMIN REMOVE] No user found - not authenticated");
    return { error: "Not authenticated" };
  }

  console.log("🔍 [ADMIN REMOVE] Fetching user profile for:", user.id);

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  console.log("🔍 [ADMIN REMOVE] Profile query result:", {
    profile,
    profileError,
    isAdmin: profile?.is_admin,
    isAdminType: typeof profile?.is_admin,
  });

  if (profileError) {
    console.log("❌ [ADMIN REMOVE] Profile query failed:", profileError);
    return { error: `Profile error: ${profileError.message}` };
  }

  if (!profile?.is_admin) {
    console.log("❌ [ADMIN REMOVE] User is not admin:", {
      profile,
      isAdmin: profile?.is_admin,
      isAdminStrict: profile?.is_admin === true,
    });
    return { error: "Unauthorized - Admin access required" };
  }

  console.log("✅ [ADMIN REMOVE] Admin verified, proceeding with removal");

  // Get the queue entry to verify it exists and get event_id
  console.log("🔍 [ADMIN REMOVE] Fetching queue entry:", queueEntryId);

  const { data: entry, error: entryError } = await supabase
    .from("queue_entries")
    .select("*")
    .eq("id", queueEntryId)
    .single();

  console.log("🔍 [ADMIN REMOVE] Queue entry result:", { entry, entryError });

  if (entryError) {
    console.log("❌ [ADMIN REMOVE] Queue entry query failed:", entryError);
    return { error: `Queue entry error: ${entryError.message}` };
  }

  if (!entry) {
    console.log("❌ [ADMIN REMOVE] Queue entry not found");
    return { error: "Queue entry not found" };
  }

  console.log("🔍 [ADMIN REMOVE] Queue entry found:", {
    id: entry.id,
    userId: entry.user_id,
    groupId: entry.group_id,
    eventId: entry.event_id,
  });

  // Check if it's a group entry - if so, remove all group members
  if (entry.group_id) {
    console.log(
      "🔍 [ADMIN REMOVE] Removing group entries for group:",
      entry.group_id
    );

    const { error: groupError } = await supabase
      .from("queue_entries")
      .delete()
      .eq("group_id", entry.group_id);

    if (groupError) {
      console.log("❌ [ADMIN REMOVE] Group removal failed:", groupError);
      return { error: groupError.message };
    }

    console.log("✅ [ADMIN REMOVE] Group entries removed successfully");
  } else {
    console.log("🔍 [ADMIN REMOVE] Removing single entry:", queueEntryId);

    const { error } = await supabase
      .from("queue_entries")
      .delete()
      .eq("id", queueEntryId);

    if (error) {
      console.log("❌ [ADMIN REMOVE] Single entry removal failed:", error);
      return { error: error.message };
    }

    console.log("✅ [ADMIN REMOVE] Single entry removed successfully");
  }

  // Reorder remaining queue positions
  await reorderQueue(entry.event_id);

  // Log admin activity (optional - you can add this if you want to track admin actions)
  console.log(
    `Admin ${user.id} removed queue entry ${queueEntryId}${
      reason ? ` - Reason: ${reason}` : ""
    }`
  );

  revalidatePath(`/events/${entry.event_id}`);
  revalidatePath(`/admin/events/${entry.event_id}`);

  return { error: null };
}
