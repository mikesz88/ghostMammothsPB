"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useTestControlRun() {
  const [loading, setLoading] = useState(false);
  const run = useCallback(
    async (fn: () => Promise<void>, errLabel: string) => {
      setLoading(true);
      try {
        await fn();
      } catch (err) {
        console.error(err);
        toast.error(errLabel);
      } finally {
        setLoading(false);
      }
    },
    [],
  );
  return { loading, run };
}
