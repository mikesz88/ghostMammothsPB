import type { ReactNode } from "react";

export function SettingsHubPrefNavigationCardLead({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
