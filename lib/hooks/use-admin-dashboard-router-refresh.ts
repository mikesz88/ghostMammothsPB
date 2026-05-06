"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useAdminDashboardRouterRefresh() {
  const router = useRouter();
  return useCallback(() => router.refresh(), [router]);
}
