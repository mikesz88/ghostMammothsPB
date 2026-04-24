import { AdminUsersStatCard } from "@/components/admin/users/admin-users-stat-card";
import { ADMIN_USERS_STAT_PROPS } from "@/components/admin/users/admin-users-stat-config";

type AdminUsersStatsCardsProps = {
  totalUsers: number;
  adminCount: number;
  regularCount: number;
  freeMembersCount: number;
};

export function AdminUsersStatsCards({
  totalUsers,
  adminCount,
  regularCount,
  freeMembersCount,
}: AdminUsersStatsCardsProps) {
  const values = { totalUsers, adminCount, regularCount, freeMembersCount };
  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      {ADMIN_USERS_STAT_PROPS.map((s) => (
        <AdminUsersStatCard
          key={s.valueKey}
          label={s.label}
          value={values[s.valueKey]}
          icon={s.icon}
          iconWrapClassName={s.iconWrapClassName}
          iconClassName={s.iconClassName}
        />
      ))}
    </div>
  );
}
