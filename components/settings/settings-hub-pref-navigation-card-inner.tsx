import { ChevronRight } from "lucide-react";

import { SettingsHubPrefNavigationCardLead } from "@/components/settings/settings-hub-pref-navigation-card-lead";
import { Card, CardContent } from "@/components/ui/card";

import type { ReactNode } from "react";


export function SettingsHubPrefNavigationCardInner({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Card className="border-border hover:border-primary transition-colors cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <SettingsHubPrefNavigationCardLead
            title={title}
            description={description}
            icon={icon}
          />
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
