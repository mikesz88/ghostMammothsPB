import type { ManagerEntry } from "@/lib/queue/mappers";
import type { CourtAssignmentInsert } from "@/lib/queue/types";

export type PlayerSlot = {
  userId: string;
  name: string;
  skillLevel: string;
};

function pushNamedPlayerSlots(
  entry: ManagerEntry,
  groupSize: number,
  playerNames: Array<{ name: string; skillLevel: string }>,
  playerSlots: PlayerSlot[],
) {
  for (let i = 0; i < groupSize; i++) {
    playerSlots.push({
      userId: entry.userId,
      name: playerNames[i]?.name || entry.user?.name || "Player",
      skillLevel:
        playerNames[i]?.skillLevel || entry.user?.skillLevel || "intermediate",
    });
  }
}

function pushAnonymousPlayerSlots(
  entry: ManagerEntry,
  groupSize: number,
  playerSlots: PlayerSlot[],
) {
  for (let i = 0; i < groupSize; i++) {
    playerSlots.push({
      userId: entry.userId,
      name: entry.user?.name || "Player",
      skillLevel: entry.user?.skillLevel || "intermediate",
    });
  }
}

export function expandNextPlayersToPlayerSlots(
  nextPlayers: ManagerEntry[],
): PlayerSlot[] {
  const playerSlots: PlayerSlot[] = [];

  for (const entry of nextPlayers) {
    const groupSize = entry.groupSize || 1;
    const playerNames = entry.player_names || [];
    if (playerNames.length > 0) {
      pushNamedPlayerSlots(entry, groupSize, playerNames, playerSlots);
    } else {
      pushAnonymousPlayerSlots(entry, groupSize, playerSlots);
    }
  }

  return playerSlots;
}

export function buildCourtAssignmentInsert(
  eventId: string,
  courtNumber: number,
  nextPlayers: ManagerEntry[],
  playerSlots: PlayerSlot[],
): CourtAssignmentInsert {
  const assignmentData: CourtAssignmentInsert = {
    event_id: eventId,
    court_number: courtNumber,
    started_at: new Date().toISOString(),
    player_names: playerSlots.map((p) => p.name),
    queue_entry_ids: nextPlayers.map((p) => p.id),
  };

  if (playerSlots[0]) assignmentData.player1_id = playerSlots[0].userId;
  if (playerSlots[1]) assignmentData.player2_id = playerSlots[1].userId;
  if (playerSlots[2]) assignmentData.player3_id = playerSlots[2].userId;
  if (playerSlots[3]) assignmentData.player4_id = playerSlots[3].userId;
  if (playerSlots[4]) assignmentData.player5_id = playerSlots[4].userId;
  if (playerSlots[5]) assignmentData.player6_id = playerSlots[5].userId;
  if (playerSlots[6]) assignmentData.player7_id = playerSlots[6].userId;
  if (playerSlots[7]) assignmentData.player8_id = playerSlots[7].userId;

  return assignmentData;
}
