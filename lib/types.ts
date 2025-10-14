export type SkillLevel = "beginner" | "intermediate" | "advanced" | "pro";
export type EventStatus = "active" | "ended";
export type QueueStatus = "waiting" | "playing" | "completed";
export type RotationType = "2-stay-4-off" | "winners-stay" | "rotate-all";
export type GroupSize = 1 | 2 | 3 | 4;
export type TeamSize = 1 | 2 | 3 | 4;

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  skillLevel: SkillLevel;
  isAdmin: boolean;
  createdAt: Date;
}

export interface Event {
  id: string;
  name: string;
  location: string;
  date: Date;
  time?: string; // TIME field (HH:MM:SS format) - separate from date
  numCourts?: string; // TEXT field - duplicate of courtCount (legacy)
  courtCount: number; // SMALLINT field - actual court count
  teamSize: TeamSize; // 1=solo(1v1), 2=doubles(2v2), 3=triplets(3v3), 4=quads(4v4)
  rotationType: RotationType;
  status: EventStatus;
  createdAt: Date;
  updatedAt?: Date;
}

export interface QueueEntry {
  id: string;
  eventId: string;
  userId: string;
  groupId?: string;
  groupSize: GroupSize;
  position: number;
  status: QueueStatus;
  joinedAt: Date;
  user?: User;
}

export interface CourtAssignment {
  id: string;
  eventId: string;
  courtNumber: number;
  player1Id?: string;
  player2Id?: string;
  player3Id?: string;
  player4Id?: string;
  player5Id?: string;
  player6Id?: string;
  player7Id?: string;
  player8Id?: string;
  startedAt: Date;
  endedAt?: Date;
  player1?: User;
  player2?: User;
  player3?: User;
  player4?: User;
  player5?: User;
  player6?: User;
  player7?: User;
  player8?: User;
}
