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

export async function resetTestEvent(eventId: string) {
  const supabase = await createClient();

  // 1. Clear all queue entries for this event
  await supabase.from("queue_entries").delete().eq("event_id", eventId);

  // 2. End all active court assignments
  await supabase
    .from("court_assignments")
    .update({ ended_at: new Date().toISOString() })
    .eq("event_id", eventId)
    .is("ended_at", null);

  // 3. Add first 8 test users to queue
  const usersToAdd = TEST_USER_IDS.slice(0, 8);

  let successCount = 0;
  for (let i = 0; i < usersToAdd.length; i++) {
    const { error } = await supabase.from("queue_entries").insert({
      event_id: eventId,
      user_id: usersToAdd[i],
      position: i + 1,
      status: "waiting",
      group_size: 1,
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

export async function addDummyUsersToQueue(eventId: string, count: number = 4) {
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

  const usersToAdd = availableUsers.slice(0, count);

  // Check for insert errors
  let successCount = 0;
  for (let i = 0; i < usersToAdd.length; i++) {
    const { error } = await supabase.from("queue_entries").insert({
      event_id: eventId,
      user_id: usersToAdd[i],
      position: startPosition + i,
      status: "waiting",
      group_size: 1,
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

  const playersPerCourt = event.team_size * 2;

  // Get active assignments
  const { data: activeAssignments } = await supabase
    .from("court_assignments")
    .select("court_number")
    .eq("event_id", eventId)
    .is("ended_at", null);

  const occupiedCourts = new Set(
    activeAssignments?.map((a) => a.court_number) || []
  );

  // Get waiting players
  const { data: waitingPlayers } = await supabase
    .from("queue_entries")
    .select("*")
    .eq("event_id", eventId)
    .eq("status", "waiting")
    .order("position", { ascending: true });

  if (!waitingPlayers || waitingPlayers.length < playersPerCourt) {
    return { success: false, error: "Not enough players in queue" };
  }

  let playerIndex = 0;
  let courtsCreated = 0;

  // Fill available courts
  for (let courtNum = 1; courtNum <= event.court_count; courtNum++) {
    if (occupiedCourts.has(courtNum)) continue;
    if (playerIndex + playersPerCourt > waitingPlayers.length) break;

    const playersForCourt = waitingPlayers.slice(
      playerIndex,
      playerIndex + playersPerCourt
    );

    const assignment: any = {
      event_id: eventId,
      court_number: courtNum,
      started_at: new Date().toISOString(),
    };

    // Assign players based on team size
    if (playersForCourt[0]) assignment.player1_id = playersForCourt[0].user_id;
    if (playersForCourt[1]) assignment.player2_id = playersForCourt[1].user_id;
    if (playersForCourt[2]) assignment.player3_id = playersForCourt[2].user_id;
    if (playersForCourt[3]) assignment.player4_id = playersForCourt[3].user_id;
    if (playersForCourt[4]) assignment.player5_id = playersForCourt[4].user_id;
    if (playersForCourt[5]) assignment.player6_id = playersForCourt[5].user_id;
    if (playersForCourt[6]) assignment.player7_id = playersForCourt[6].user_id;
    if (playersForCourt[7]) assignment.player8_id = playersForCourt[7].user_id;

    await supabase.from("court_assignments").insert(assignment);

    // Update queue entries to "playing"
    for (const player of playersForCourt) {
      await supabase
        .from("queue_entries")
        .update({ status: "playing" })
        .eq("id", player.id);
    }

    playerIndex += playersPerCourt;
    courtsCreated++;
  }

  revalidatePath(`/admin/events/${eventId}`);
  return { success: true, courtsCreated };
}
