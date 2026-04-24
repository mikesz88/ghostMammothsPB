"use client";

import { useState } from "react";

import type { RotationType } from "@/lib/types";

export function useTestControlFields(current: {
  currentRotationType: RotationType;
  currentTeamSize: number;
  currentCourtCount: number;
}) {
  const [rotationType, setRotationType] = useState(current.currentRotationType);
  const [teamSize, setTeamSize] = useState(current.currentTeamSize);
  const [courtCount, setCourtCount] = useState(current.currentCourtCount);
  const [groupSize, setGroupSize] = useState(1);
  return {
    rotationType,
    setRotationType,
    teamSize,
    setTeamSize,
    courtCount,
    setCourtCount,
    groupSize,
    setGroupSize,
  };
}
