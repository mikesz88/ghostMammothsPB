"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import type { EmailStatsTimeRange } from "@/lib/admin/email-stats-types";

const RANGE_OPTIONS: { key: EmailStatsTimeRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "Last 7 Days" },
  { key: "month", label: "Last 30 Days" },
  { key: "all", label: "All Time" },
];

export function EmailStatsRangeButtons({
  timeRange,
}: {
  timeRange: EmailStatsTimeRange;
}) {
  const router = useRouter();
  return (
    <div className="flex gap-2 mb-8">
      {RANGE_OPTIONS.map(({ key, label }) => (
        <Button
          key={key}
          variant={timeRange === key ? "default" : "outline"}
          type="button"
          onClick={() => router.push(`/admin/email-stats?range=${key}`)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
