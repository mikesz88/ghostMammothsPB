import type { LucideIcon } from "lucide-react";

export function EventDetailStatTileIcon({
  icon: Icon,
  iconBgClass,
  iconClass,
}: {
  icon: LucideIcon;
  iconBgClass: string;
  iconClass: string;
}) {
  return (
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgClass}`}
    >
      <Icon className={`w-5 h-5 ${iconClass}`} />
    </div>
  );
}
