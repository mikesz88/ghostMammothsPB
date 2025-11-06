"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendQueueNotification } from "./notifications";
import type { Database } from "@/supabase/supa-schema";
import type { GroupSize } from "@/lib/types";

type QueueEntryRow = Database["public"]["Tables"]["queue_entries"]["Row"];
type CourtAssignmentInsert =
  Database["public"]["Tables"]["court_assignments"]["Insert"];
type UserMembershipRow =
  Database["public"]["Tables"]["user_memberships"]["Row"];

// Custom type for the query result with partial user data
type QueueEntryWithUser = QueueEntryRow & {
  user: {
    id: string;
    name: string;
    email: string;
    skill_level: string;
  } | null;
};

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
  groupId?: string,
  playerNames?: Array<{ name: string; skillLevel: string }>
) {
  const supabase = await createClient();

  // Ensure user has an active paid membership before joining the queue
  const { data: membershipData } = await supabase
    .from("user_memberships")
    .select(
      `
      status,
      tier:membership_tiers(price)
    `
    )
    .eq("user_id", userId)
    .single();

  type MembershipWithTier = UserMembershipRow & {
    tier: { price: number } | null;
  };

  const membershipRecord = membershipData as MembershipWithTier | null;

  const hasActiveTier =
    membershipRecord?.status &&
    (membershipRecord.status === "active" ||
      membershipRecord.status === "trialing");
  const tierPrice = membershipRecord?.tier?.price ?? 0;
  const isPaidTier = tierPrice > 0;

  let hasPaidMembership = !!(hasActiveTier && isPaidTier);

  if (!hasPaidMembership) {
    const { data: userRecord } = await supabase
      .from("users")
      .select("membership_status")
      .eq("id", userId)
      .single();

    if (
      userRecord?.membership_status &&
      userRecord.membership_status !== "free"
    ) {
      hasPaidMembership = true;
    }
  }

  if (!hasPaidMembership) {
    return {
      error:
        "A paid membership is required to join the queue. Visit the membership page to upgrade.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return { error: "Not authenticated" };
  }

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
      player_names: playerNames || [],
      position: position,
      status: "waiting",
    })
    .select()
    .single();

  if (error) {
    console.error("Error joining queue:", error);
    return { error: error.message };
  }

  // Send email notification (async, don't await to avoid blocking)
  sendQueueNotification(userId, eventId, position, "join").catch((err) =>
    console.error("Failed to send join email:", err)
  );

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
    .order("position");

  if (queue) {
    // Track notifications to avoid spamming
    const upNextNotifications: Promise<unknown>[] = [];
    const positionUpdateNotifications: Promise<unknown>[] = [];

    // Update positions
    for (let i = 0; i < queue.length; i++) {
      const newPosition = i + 1;
      const oldPosition = queue[i].position;

      await supabase
        .from("queue_entries")
        .update({ position: newPosition })
        .eq("id", queue[i].id);

      // Send "up next" email if they just entered top 4
      if (newPosition <= 4 && oldPosition > 4) {
        upNextNotifications.push(
          sendQueueNotification(
            queue[i].user_id,
            eventId,
            newPosition,
            "up-next"
          )
        );
      }
      // Send position update if they moved up significantly (3+ positions)
      else if (oldPosition - newPosition >= 3) {
        positionUpdateNotifications.push(
          sendQueueNotification(
            queue[i].user_id,
            eventId,
            newPosition,
            "position-update"
          )
        );
      }
    }

    // Send notifications without blocking
    Promise.all([...upNextNotifications, ...positionUpdateNotifications]).catch(
      (err) => console.error("Error sending position update emails:", err)
    );
  }
}

export async function assignPlayersToNextCourt(eventId: string) {
  const supabase = await createClient();

  // Get event details
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { success: false, error: "Event not found" };
  }

  const playersPerCourt = event.team_size * 2;

  // Get waiting queue entries with user data
  const { data: queueData, error: queueError } = await supabase
    .from("queue_entries")
    .select(
      `
      *,
      user:users(id, name, email, skill_level)
    `
    )
    .eq("event_id", eventId)
    .eq("status", "waiting")
    .order("position");

  if (queueError) {
    return { success: false, error: "Failed to fetch queue" };
  }

  // Import QueueManager dynamically to use getNextPlayers
  const { QueueManager } = await import("@/lib/queue-manager");

  // Map to QueueEntry type
  const waitingQueue = (queueData || []).map((entry: QueueEntryWithUser) => {
    // Parse player_names JSON if it exists
    let playerNamesArray: Array<{ name: string; skillLevel: string }> = [];
    if (entry.player_names) {
      try {
        const parsed = entry.player_names as unknown as Array<{
          name: string;
          skillLevel: string;
        }>;
        playerNamesArray = Array.isArray(parsed) ? parsed : [];
      } catch {
        playerNamesArray = [];
      }
    }

    return {
      id: entry.id,
      eventId: entry.event_id,
      userId: entry.user_id,
      groupId: entry.group_id || undefined,
      groupSize: (entry.group_size || 1) as GroupSize,
      player_names: playerNamesArray,
      position: entry.position,
      status: entry.status as "waiting" | "playing" | "completed",
      joinedAt: new Date(entry.joined_at),
      user: entry.user
        ? {
            id: entry.user.id,
            name: entry.user.name,
            email: entry.user.email,
            skillLevel: entry.user.skill_level as
              | "beginner"
              | "intermediate"
              | "advanced"
              | "pro",
            isAdmin: false,
            createdAt: new Date(),
          }
        : undefined,
    };
  });

  const nextPlayers = QueueManager.getNextPlayers(
    waitingQueue,
    playersPerCourt
  );

  // Count total players (considering group_size)
  const totalPlayerCount = nextPlayers.reduce(
    (sum, entry) => sum + (entry.groupSize || 1),
    0
  );

  if (totalPlayerCount < playersPerCourt) {
    return {
      success: false,
      error: `Not enough players in queue. Need ${playersPerCourt} players.`,
    };
  }

  // Find an available court
  const { data: activeAssignments } = await supabase
    .from("court_assignments")
    .select("court_number")
    .eq("event_id", eventId)
    .is("ended_at", null);

  const activeCourts = new Set(
    activeAssignments?.map((a) => a.court_number) || []
  );

  let availableCourt: number | null = null;
  for (let i = 1; i <= event.court_count; i++) {
    if (!activeCourts.has(i)) {
      availableCourt = i;
      break;
    }
  }

  if (availableCourt === null) {
    return { success: false, error: "No available courts" };
  }

  // Delete any ended assignments for this court to avoid unique constraint violation
  await supabase
    .from("court_assignments")
    .delete()
    .eq("event_id", eventId)
    .eq("court_number", availableCourt)
    .not("ended_at", "is", null);

  // Create court assignment with dynamic player slots
  const assignmentData: CourtAssignmentInsert = {
    event_id: eventId,
    court_number: availableCourt,
    started_at: new Date().toISOString(),
    player_names: [],
    queue_entry_ids: nextPlayers.map((p) => p.id),
  };

  // Expand queue entries to individual player slots (handling group_size)
  const playerSlots: Array<{
    userId: string;
    name: string;
    skillLevel: string;
  }> = [];

  for (const entry of nextPlayers) {
    const groupSize = entry.groupSize || 1;
    const playerNames = entry.player_names || [];

    // If we have player_names stored, use those
    if (playerNames.length > 0) {
      for (let i = 0; i < groupSize; i++) {
        playerSlots.push({
          userId: entry.userId,
          name: playerNames[i]?.name || entry.user?.name || "Player",
          skillLevel:
            playerNames[i]?.skillLevel ||
            entry.user?.skillLevel ||
            "intermediate",
        });
      }
    } else {
      // Fallback: use the user's name for all slots
      for (let i = 0; i < groupSize; i++) {
        playerSlots.push({
          userId: entry.userId,
          name: entry.user?.name || "Player",
          skillLevel: entry.user?.skillLevel || "intermediate",
        });
      }
    }
  }

  // Store player names for display
  assignmentData.player_names = playerSlots.map((p) => p.name);

  // Assign players to slots (using userId for database)
  if (playerSlots[0]) assignmentData.player1_id = playerSlots[0].userId;
  if (playerSlots[1]) assignmentData.player2_id = playerSlots[1].userId;
  if (playerSlots[2]) assignmentData.player3_id = playerSlots[2].userId;
  if (playerSlots[3]) assignmentData.player4_id = playerSlots[3].userId;
  if (playerSlots[4]) assignmentData.player5_id = playerSlots[4].userId;
  if (playerSlots[5]) assignmentData.player6_id = playerSlots[5].userId;
  if (playerSlots[6]) assignmentData.player7_id = playerSlots[6].userId;
  if (playerSlots[7]) assignmentData.player8_id = playerSlots[7].userId;

  const { error: assignmentError } = await supabase
    .from("court_assignments")
    .insert(assignmentData);

  if (assignmentError) {
    console.error("Error creating assignment:", assignmentError);
    return {
      success: false,
      error: `Failed to assign players: ${assignmentError.message}`,
    };
  }

  // Update queue entries to "playing"
  for (const player of nextPlayers) {
    const { error: updateError } = await supabase
      .from("queue_entries")
      .update({ status: "playing" })
      .eq("id", player.id);

    if (updateError) {
      console.error(`Failed to update player ${player.id}:`, updateError);
    }

    // Send court assignment email notification
    sendQueueNotification(
      player.userId,
      eventId,
      player.position,
      "court-assignment",
      availableCourt
    ).catch((err) =>
      console.error("Failed to send court assignment email:", err)
    );
  }

  // Reorder remaining waiting players to fill gaps in positions
  await reorderQueue(eventId);

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}`);

  return {
    success: true,
    courtNumber: availableCourt,
    playersAssigned: playersPerCourt,
  };
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
