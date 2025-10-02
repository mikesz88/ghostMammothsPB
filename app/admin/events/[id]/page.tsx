"use client"

import { useState } from "react"
import { use } from "react"
import Link from "next/link"
import { Trophy, ArrowLeft, Users, Clock, MapPin, Calendar, Play, Trash2, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QueueList } from "@/components/queue-list"
import { CourtStatus } from "@/components/court-status"
import { QueueManager } from "@/lib/queue-manager"
import { AdminActivityLogger } from "@/lib/admin-middleware"
import type { Event, QueueEntry, CourtAssignment, User } from "@/lib/types"

// Mock data
const mockEvent: Event = {
  id: "1",
  name: "Saturday Morning Doubles",
  location: "Central Park Courts",
  date: new Date("2025-10-04T09:00:00"),
  courtCount: 4,
  rotationType: "2-stay-4-off",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockUsers: User[] = [
  {
    id: "u1",
    name: "Alex Johnson",
    email: "alex@example.com",
    skillLevel: "advanced",
    isAdmin: false,
    createdAt: new Date(),
  },
  {
    id: "u2",
    name: "Sam Chen",
    email: "sam@example.com",
    skillLevel: "intermediate",
    isAdmin: false,
    createdAt: new Date(),
  },
  {
    id: "p1",
    name: "Chris Martinez",
    email: "chris@example.com",
    skillLevel: "pro",
    isAdmin: false,
    createdAt: new Date(),
  },
  {
    id: "p2",
    name: "Morgan Davis",
    email: "morgan@example.com",
    skillLevel: "advanced",
    isAdmin: false,
    createdAt: new Date(),
  },
  {
    id: "p3",
    name: "Riley Brown",
    email: "riley@example.com",
    skillLevel: "advanced",
    isAdmin: false,
    createdAt: new Date(),
  },
  {
    id: "p4",
    name: "Casey Wilson",
    email: "casey@example.com",
    skillLevel: "intermediate",
    isAdmin: false,
    createdAt: new Date(),
  },
]

const mockQueue: QueueEntry[] = [
  {
    id: "1",
    eventId: "1",
    userId: "u1",
    groupSize: 1,
    position: 1,
    status: "waiting",
    joinedAt: new Date(),
    user: mockUsers[0],
  },
  {
    id: "2",
    eventId: "1",
    userId: "u2",
    groupSize: 1,
    position: 2,
    status: "waiting",
    joinedAt: new Date(),
    user: mockUsers[1],
  },
]

const mockAssignments: CourtAssignment[] = [
  {
    id: "a1",
    eventId: "1",
    courtNumber: 1,
    player1Id: "p1",
    player2Id: "p2",
    player3Id: "p3",
    player4Id: "p4",
    startedAt: new Date(),
    player1: mockUsers[2],
    player2: mockUsers[3],
    player3: mockUsers[4],
    player4: mockUsers[5],
  },
]

export default function AdminEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [event] = useState<Event>(mockEvent)
  const [queue, setQueue] = useState<QueueEntry[]>(mockQueue)
  const [assignments, setAssignments] = useState<CourtAssignment[]>(mockAssignments)
  const [users] = useState<User[]>(mockUsers)
  const [showActivityLog, setShowActivityLog] = useState(false)
  const [activities] = useState(AdminActivityLogger.getActivities(id))

  const waitingCount = queue.filter((e) => e.status === "waiting").length
  const playingCount = assignments.filter((a) => !a.endedAt).length * 4

  const handleAssignNext = () => {
    const newAssignments = QueueManager.assignNextPlayers(queue, event.courtCount, assignments, event.rotationType)

    if (newAssignments.length === 0) {
      alert("Not enough players in queue or no available courts")
      return
    }

    AdminActivityLogger.log(
      "admin1",
      "Admin User",
      "assign-players",
      `Assigned ${newAssignments.length * 4} players to courts`,
      id,
    )

    const courtAssignments: CourtAssignment[] = newAssignments.map((assignment) => ({
      id: Math.random().toString(),
      eventId: id,
      courtNumber: assignment.courtNumber,
      player1Id: assignment.playerIds[0],
      player2Id: assignment.playerIds[1],
      player3Id: assignment.playerIds[2],
      player4Id: assignment.playerIds[3],
      startedAt: new Date(),
      player1: users.find((u) => u.id === assignment.playerIds[0]),
      player2: users.find((u) => u.id === assignment.playerIds[1]),
      player3: users.find((u) => u.id === assignment.playerIds[2]),
      player4: users.find((u) => u.id === assignment.playerIds[3]),
    }))

    const assignedPlayerIds = new Set(newAssignments.flatMap((a) => a.playerIds))
    const updatedQueue = queue.map((entry) =>
      assignedPlayerIds.has(entry.userId) ? { ...entry, status: "playing" as const } : entry,
    )

    setAssignments([...assignments, ...courtAssignments])
    setQueue(QueueManager.reorderQueue(updatedQueue))
  }

  const handleCompleteGame = (assignmentId: string, winningTeam: "team1" | "team2") => {
    const assignment = assignments.find((a) => a.id === assignmentId)
    if (!assignment) return

    AdminActivityLogger.log(
      "admin1",
      "Admin User",
      "complete-game",
      `Completed game on court ${assignment.courtNumber}, ${winningTeam} won`,
      id,
    )

    const { playersToStay, playersToQueue } = QueueManager.handleGameCompletion(
      assignment,
      event.rotationType,
      winningTeam,
      queue,
    )

    const updatedAssignments = assignments.map((a) => (a.id === assignmentId ? { ...a, endedAt: new Date() } : a))

    const updatedQueue = QueueManager.addPlayersToQueue(playersToQueue, queue, id, users)

    if (playersToStay.length > 0) {
      const nextAssignment = QueueManager.createNextAssignment(assignment.courtNumber, playersToStay, updatedQueue, id)

      if (nextAssignment) {
        const newAssignment: CourtAssignment = {
          id: Math.random().toString(),
          ...nextAssignment.assignment,
          player1: users.find((u) => u.id === nextAssignment.assignment.player1Id),
          player2: users.find((u) => u.id === nextAssignment.assignment.player2Id),
          player3: users.find((u) => u.id === nextAssignment.assignment.player3Id),
          player4: users.find((u) => u.id === nextAssignment.assignment.player4Id),
        } as CourtAssignment

        updatedAssignments.push(newAssignment)

        const newlyAssignedIds = new Set(nextAssignment.assignedQueueEntries.map((e) => e.userId))
        const finalQueue = updatedQueue.map((entry) =>
          newlyAssignedIds.has(entry.userId) ? { ...entry, status: "playing" as const } : entry,
        )

        setQueue(QueueManager.reorderQueue(finalQueue))
      } else {
        setQueue(QueueManager.reorderQueue(updatedQueue))
      }
    } else {
      setQueue(QueueManager.reorderQueue(updatedQueue))
    }

    setAssignments(updatedAssignments)
  }

  const handleForceRemove = (entryId: string) => {
    if (confirm("Are you sure you want to remove this player from the queue?")) {
      const entry = queue.find((e) => e.id === entryId)
      if (!entry) return

      AdminActivityLogger.log("admin1", "Admin User", "force-remove", `Removed ${entry.user?.name} from queue`, id)

      const entriesToRemove = entry.groupId ? queue.filter((e) => e.groupId === entry.groupId) : [entry]
      const updatedQueue = queue.filter((e) => !entriesToRemove.some((r) => r.id === e.id))
      setQueue(QueueManager.reorderQueue(updatedQueue))
    }
  }

  const handleClearQueue = () => {
    if (confirm("Are you sure you want to clear the entire queue? This cannot be undone.")) {
      AdminActivityLogger.log(
        "admin1",
        "Admin User",
        "clear-queue",
        `Cleared entire queue (${waitingCount} players)`,
        id,
      )
      setQueue([])
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Ghost Mammoths PB</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowActivityLog(!showActivityLog)}>
              <History className="w-4 h-4" />
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Event Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{event.name}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {event.date.toLocaleDateString()} at{" "}
                  {event.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="default" className="text-sm">
                Admin View
              </Badge>
              <Badge variant="outline" className="text-sm">
                {event.rotationType}
              </Badge>
            </div>
          </div>

          {showActivityLog && (
            <Card className="border-border bg-background mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-3">Recent Admin Activity</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activity yet</p>
                  ) : (
                    activities.map((activity) => (
                      <div key={activity.id} className="text-sm border-l-2 border-primary pl-3 py-1">
                        <p className="text-foreground">
                          <span className="font-medium">{activity.adminName}</span> {activity.details}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleTimeString()} - {activity.action}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-3 gap-4">
            <Card className="border-border bg-background">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{waitingCount}</p>
                    <p className="text-sm text-muted-foreground">In Queue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-background">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{playingCount}</p>
                    <p className="text-sm text-muted-foreground">Playing Now</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-background">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {QueueManager.estimateWaitTime(waitingCount, event.courtCount)}m
                    </p>
                    <p className="text-sm text-muted-foreground">Est. Wait</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={handleAssignNext} size="lg" className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Assign Next Players to Courts
            </Button>
            <Button onClick={handleClearQueue} size="lg" variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Queue
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Court Status */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Court Status</h2>
              <Badge variant="outline">{event.courtCount} courts</Badge>
            </div>
            <CourtStatus
              courtCount={event.courtCount}
              assignments={assignments}
              onCompleteGame={handleCompleteGame}
              isAdmin={true}
            />
          </div>

          {/* Queue */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Queue Management</h2>
            </div>
            <QueueList queue={queue} onRemove={handleForceRemove} />
          </div>
        </div>
      </div>
    </div>
  )
}
