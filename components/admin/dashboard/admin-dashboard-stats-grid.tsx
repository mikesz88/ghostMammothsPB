import { Calendar, Settings, Trophy } from "lucide-react";

import { AdminDashboardEmailStatsCard } from "@/components/admin/dashboard/admin-dashboard-email-stats-card";
import { AdminDashboardStatCountCard } from "@/components/admin/dashboard/admin-dashboard-stat-count-card";

const STAT_DEFS = [
  {
    label: "Active Events",
    key: "active" as const,
    icon: Calendar,
    iconWrapClassName: "bg-primary/10 text-primary",
  },
  {
    label: "Total Courts",
    key: "courts" as const,
    icon: Trophy,
    iconWrapClassName: "bg-primary/10 text-primary",
  },
  {
    label: "Ended Events",
    key: "ended" as const,
    icon: Settings,
    iconWrapClassName: "bg-muted/50 text-muted-foreground",
  },
];

export function AdminDashboardStatsGrid({
  activeCount,
  totalCourts,
  endedCount,
}: {
  activeCount: number;
  totalCourts: number;
  endedCount: number;
}) {
  const values = { active: activeCount, courts: totalCourts, ended: endedCount };
  return (
    <div className="grid md:grid-cols-4 gap-6 mb-12">
      {STAT_DEFS.map((def) => (
        <AdminDashboardStatCountCard
          key={def.key}
          label={def.label}
          value={values[def.key]}
          icon={def.icon}
          iconWrapClassName={def.iconWrapClassName}
        />
      ))}
      <AdminDashboardEmailStatsCard />
    </div>
  );
}
