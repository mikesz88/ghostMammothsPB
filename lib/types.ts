export type SkillLevel = "beginner" | "intermediate" | "advanced" | "pro"
export type EventStatus = "active" | "ended"
export type QueueStatus = "waiting" | "playing" | "completed"
export type RotationType = "2-stay-4-off" | "winners-stay" | "rotate-all"
export type GroupSize = 1 | 2 | 3 | 4

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  skillLevel: SkillLevel
  isAdmin: boolean
  createdAt: Date
}

export interface Event {
  id: string
  name: string
  location: string
  date: Date
  courtCount: number
  rotationType: RotationType
  status: EventStatus
  createdAt: Date
  updatedAt: Date
}

export interface QueueEntry {
  id: string
  eventId: string
  userId: string
  groupId?: string
  groupSize: GroupSize
  position: number
  status: QueueStatus
  joinedAt: Date
  user?: User
}

export interface CourtAssignment {
  id: string
  eventId: string
  courtNumber: number
  player1Id?: string
  player2Id?: string
  player3Id?: string
  player4Id?: string
  startedAt: Date
  endedAt?: Date
  player1?: User
  player2?: User
  player3?: User
  player4?: User
}
