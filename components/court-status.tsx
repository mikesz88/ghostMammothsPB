"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import type { CourtAssignment } from "@/lib/types";

interface CourtStatusProps {
  courtCount: number;
  assignments: CourtAssignment[];
  onCompleteGame?: (
    assignmentId: string,
    winningTeam: "team1" | "team2"
  ) => void;
  isAdmin?: boolean;
  teamSize?: number;
}

export function CourtStatus({
  courtCount,
  assignments,
  onCompleteGame,
  isAdmin,
  teamSize = 2,
}: CourtStatusProps) {
  const courts = Array.from({ length: courtCount }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      {courts.map((courtNumber) => {
        const assignment = assignments.find(
          (a) => a.courtNumber === courtNumber && !a.endedAt
        );

        return (
          <Card key={courtNumber} className="border-border bg-card w-full overflow-hidden">
            <CardHeader className="pb-3 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg text-foreground">
                  Court {courtNumber}
                </CardTitle>
                <Badge variant={assignment ? "default" : "secondary"} className="shrink-0">
                  {assignment ? "In Use" : "Available"}
                </Badge>
              </div>
            </CardHeader>
            {assignment && (
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Team 1
                    </p>
                    <div className="space-y-2">
                      {(() => {
                        // Use player_names if available, otherwise fall back to player objects
                        const playerNames = assignment.player_names || [];
                        const players = [
                          assignment.player1,
                          assignment.player2,
                          assignment.player3,
                          assignment.player4,
                          assignment.player5,
                          assignment.player6,
                          assignment.player7,
                          assignment.player8,
                        ].filter(Boolean);

                        const team1Names =
                          playerNames.length > 0
                            ? playerNames.slice(0, teamSize)
                            : players
                                .slice(0, teamSize)
                                .map((p) => p?.name || "Player");

                        return team1Names.map((name, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <span className="text-foreground">{name}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Team 2
                    </p>
                    <div className="space-y-2">
                      {(() => {
                        // Use player_names if available, otherwise fall back to player objects
                        const playerNames = assignment.player_names || [];
                        const players = [
                          assignment.player1,
                          assignment.player2,
                          assignment.player3,
                          assignment.player4,
                          assignment.player5,
                          assignment.player6,
                          assignment.player7,
                          assignment.player8,
                        ].filter(Boolean);

                        const team2Names =
                          playerNames.length > 0
                            ? playerNames.slice(teamSize, teamSize * 2)
                            : players
                                .slice(teamSize, teamSize * 2)
                                .map((p) => p?.name || "Player");

                        return team2Names.map((name, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <span className="text-foreground">{name}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                {isAdmin && onCompleteGame && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCompleteGame(assignment.id, "team1")}
                      className="w-full"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Team 1 Wins
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCompleteGame(assignment.id, "team2")}
                      className="w-full"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Team 2 Wins
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
