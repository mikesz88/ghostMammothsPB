import { Users, Shield, UserPlus } from "lucide-react";

export const ADMIN_USERS_STAT_PROPS = [
  {
    label: "Total Users",
    icon: Users,
    iconWrapClassName: "bg-primary/10",
    iconClassName: "text-primary",
    valueKey: "totalUsers" as const,
  },
  {
    label: "Admins",
    icon: Shield,
    iconWrapClassName: "bg-primary/10",
    iconClassName: "text-primary",
    valueKey: "adminCount" as const,
  },
  {
    label: "Regular Users",
    icon: Users,
    iconWrapClassName: "bg-muted/50",
    iconClassName: "text-muted-foreground",
    valueKey: "regularCount" as const,
  },
  {
    label: "Free Members",
    icon: UserPlus,
    iconWrapClassName: "bg-muted/50",
    iconClassName: "text-muted-foreground",
    valueKey: "freeMembersCount" as const,
  },
] as const;
