"use client";

import { useCallback, useState } from "react";

export function useEventDetailClientDialogs() {
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  /** Bumps when opening join dialog so the dialog remounts with a fresh form (no reset-in-effect). */
  const [joinDialogMountKey, setJoinDialogMountKey] = useState(0);
  const [showQrDialog, setShowQrDialog] = useState(false);

  const openJoinDialog = useCallback(() => {
    setJoinDialogMountKey((k) => k + 1);
    setShowJoinDialog(true);
  }, []);

  return {
    showJoinDialog,
    setShowJoinDialog,
    joinDialogMountKey,
    openJoinDialog,
    showQrDialog,
    setShowQrDialog,
  };
}
