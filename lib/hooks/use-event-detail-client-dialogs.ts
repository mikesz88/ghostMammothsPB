"use client";

import { useState } from "react";

export function useEventDetailClientDialogs() {
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  return { showJoinDialog, setShowJoinDialog, showQrDialog, setShowQrDialog };
}
