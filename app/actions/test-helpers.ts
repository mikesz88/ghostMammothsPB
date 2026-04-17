"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { RotationType } from "@/lib/types";

const TEST_USER_IDS = [
  "00000000-0000-0000-0000-000000000001",
  "00000000-0000-0000-0000-000000000002",
  "00000000-0000-0000-0000-000000000003",
  "00000000-0000-0000-0000-000000000004",
  "00000000-0000-0000-0000-000000000005",
  "00000000-0000-0000-0000-000000000006",
  "00000000-0000-0000-0000-000000000007",
  "00000000-0000-0000-0000-000000000008",
  "00000000-0000-0000-0000-000000000009",
  "00000000-0000-0000-0000-000000000010",
  "00000000-0000-0000-0000-000000000011",
  "00000000-0000-0000-0000-000000000012",
  "00000000-0000-0000-0000-000000000013",
  "00000000-0000-0000-0000-000000000014",
  "00000000-0000-0000-0000-000000000015",
  "00000000-0000-0000-0000-000000000016",
  "00000000-0000-0000-0000-000000000017",
  "00000000-0000-0000-0000-000000000018",
  "00000000-0000-0000-0000-000000000019",
  "00000000-0000-0000-0000-000000000020",
];

const FRIEND_SUFFIXES = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

/** First token of display name for leader-scoped test labels, e.g. "Alex Smith" -> "Alex". */
function leaderShortName(leaderName: string): string {
  const trimmed = leaderName.trim();
  if (!trimmed) return "Leader";
  const first = trimmed.split(/\s+/)[0];
  return first || "Leader";
}

/** e.g. "Alex's friend A", "Alex's friend B" — makes groups easy to spot in queue/court screenshots. */
function leaderFriendLabel(leaderName: string, friendSlotIndex: number): string {
  const suffix =
    FRIEND_SUFFIXES[friendSlotIndex] ?? String(friendSlotIndex + 1);
  return `${leaderShortName(leaderName)}'s friend ${suffix}`;
}

export async function resetTestEvent(eventId: string) {
  const supabase = await createClient();

  await supabase.from("court_pending_stayers").delete().eq("event_id", eventId);

  // 1. Clear all queue entries for this event
  await supabase.from("queue_entries").delete().eq("event_id", eventId);

  // 2. End all active court assignments
  await supabase
    .from("court_assignments")
    .update({ ended_at: new Date().toISOString() })
    .eq("event_id", eventId)
    .is("ended_at", null);

  // Get event details to determine max group size
  const { data: event } = await supabase
    .from("events")
    .select("team_size")
    .eq("id", eventId)
    .single();

  const maxGroupSize = event?.team_size || 4;

  // 3. Add first 8 test users to queue with a mix of group sizes for testing
  const usersToAdd = TEST_USER_IDS.slice(0, 8);
  // Generate group sizes based on team size (respecting max group size)
  const groupSizes = [
    1,
    Math.min(2, maxGroupSize),
    1,
    Math.min(2, maxGroupSize),
    Math.min(3, maxGroupSize),
    1,
    1,
    maxGroupSize, // Last one is max group size for that team type
  ];

  // Fetch actual user data from database
  const { data: usersData } = await supabase
    .from("users")
    .select("id, name, skill_level")
    .in("id", usersToAdd);

  const usersMap = new Map(usersData?.map((u) => [u.id, u]) || []);

  const skillLevels = ["beginner", "intermediate", "advanced", "pro"];

  let successCount = 0;
  let friendSkillIndex = 0;

  for (let i = 0; i < usersToAdd.length; i++) {
    const groupSize = groupSizes[i] || 1;
    const userData = usersMap.get(usersToAdd[i]);

    if (!userData) {
      console.error(`User ${usersToAdd[i]} not found in database`);
      continue;
    }

    // Generate player_names array with user's name first, then unique friend names
    const playerNames = [];
    for (let j = 0; j < groupSize; j++) {
      if (j === 0) {
        // First player uses the actual user's name
        playerNames.push({
          name: userData.name,
          skillLevel: userData.skill_level || "intermediate",
        });
      } else {
        playerNames.push({
          name: leaderFriendLabel(userData.name, j - 1),
          skillLevel: skillLevels[(friendSkillIndex + j) % skillLevels.length],
        });
        friendSkillIndex++;
      }
    }

    const groupId = groupSize > 1 ? crypto.randomUUID() : null;

    const { error } = await supabase.from("queue_entries").insert({
      event_id: eventId,
      user_id: usersToAdd[i],
      position: i + 1,
      status: "waiting",
      group_size: groupSize,
      group_id: groupId,
      player_names: playerNames,
    });

    if (error) {
      console.error(`Failed to insert user ${usersToAdd[i]}:`, error);
    } else {
      successCount++;
    }
  }

  revalidatePath(`/admin/events/${eventId}`);
  return {
    success: successCount > 0,
    error: successCount === 0 ? "Failed to reset event" : null,
  };
}

export async function addDummyUsersToQueue(
  eventId: string,
  count: number = 1,
  groupSize: number = 1
) {
  const supabase = await createClient();

  // Get current max position
  const { data: maxPos } = await supabase
    .from("queue_entries")
    .select("position")
    .eq("event_id", eventId)
    .order("position", { ascending: false })
    .limit(1);

  const startPosition = (maxPos?.[0]?.position || 0) + 1;

  // Get users not already in queue
  const { data: currentQueue } = await supabase
    .from("queue_entries")
    .select("user_id")
    .eq("event_id", eventId);

  const usedUserIds = new Set(currentQueue?.map((q) => q.user_id) || []);
  const availableUsers = TEST_USER_IDS.filter((id) => !usedUserIds.has(id));

  // For groups, only take 'count' users (each becomes a group leader)
  const usersToAdd = availableUsers.slice(0, count);

  // Fetch actual user data from database
  const { data: usersData } = await supabase
    .from("users")
    .select("id, name, skill_level")
    .in("id", usersToAdd);

  const usersMap = new Map(usersData?.map((u) => [u.id, u]) || []);

  const skillLevels = ["beginner", "intermediate", "advanced", "pro"];

  // Check for insert errors
  let successCount = 0;
  for (let i = 0; i < usersToAdd.length; i++) {
    const userData = usersMap.get(usersToAdd[i]);

    if (!userData) {
      console.error(`User ${usersToAdd[i]} not found in database`);
      continue;
    }

    // Generate player_names array with user's name first, then unique friend names
    const playerNames = [];
    for (let j = 0; j < groupSize; j++) {
      if (j === 0) {
        // First player uses the actual user's name
        playerNames.push({
          name: userData.name,
          skillLevel: userData.skill_level || "intermediate",
        });
      } else {
        playerNames.push({
          name: leaderFriendLabel(userData.name, j - 1),
          skillLevel: skillLevels[(i + j) % skillLevels.length],
        });
      }
    }

    const groupId = groupSize > 1 ? crypto.randomUUID() : null;

    const { error } = await supabase.from("queue_entries").insert({
      event_id: eventId,
      user_id: usersToAdd[i],
      position: startPosition + i,
      status: "waiting",
      group_size: groupSize,
      group_id: groupId,
      player_names: playerNames,
    });

    if (error) {
      console.error(`Failed to insert user ${usersToAdd[i]}:`, error);
    } else {
      successCount++;
    }
  }

  revalidatePath(`/admin/events/${eventId}`);
  return {
    success: successCount > 0,
    added: successCount,
    error: successCount === 0 ? "Failed to add users to queue" : null,
  };
}

export async function clearTestEvent(eventId: string) {
  const supabase = await createClient();

  // Clear all queue entries
  await supabase.from("queue_entries").delete().eq("event_id", eventId);

  // End all active court assignments
  await supabase
    .from("court_assignments")
    .update({ ended_at: new Date().toISOString() })
    .eq("event_id", eventId)
    .is("ended_at", null);

  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function updateEventRotationType(
  eventId: string,
  rotationType: RotationType
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({ rotation_type: rotationType })
    .eq("id", eventId);

  revalidatePath(`/admin/events/${eventId}`);
  return { success: !error, error };
}

export async function updateEventTeamSize(eventId: string, teamSize: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({ team_size: teamSize })
    .eq("id", eventId);

  revalidatePath(`/admin/events/${eventId}`);
  return { success: !error, error };
}

export async function updateEventCourtCount(
  eventId: string,
  courtCount: number
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({ court_count: courtCount })
    .eq("id", eventId);

  revalidatePath(`/admin/events/${eventId}`);
  return { success: !error, error };
}

export async function fillAllCourts(eventId: string) {
  const supabase = await createClient();

  // Get event details
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!event) {
    return { success: false, error: "Event not found" };
  }

  // Import the new server action
  const { assignPlayersToNextCourt } = await import("./queue");

  let courtsCreated = 0;
  let hasMoreCourts = true;

  // Keep assigning players to courts until all courts are filled or no more players
  while (hasMoreCourts) {
    const result = await assignPlayersToNextCourt(eventId);

    if (result.success) {
      courtsCreated++;
    } else {
      // Stop if no more courts available or not enough players
      hasMoreCourts = false;
    }
  }

  return { success: true, courtsCreated };
}
