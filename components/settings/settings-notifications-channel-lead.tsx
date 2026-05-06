import { Label } from "@/components/ui/label";

import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  htmlFor: string;
  descId: string;
  title: string;
  description: string;
};
// eslint-disable-next-line max-lines-per-function
export function SettingsNotificationsChannelLead({
  icon,
  htmlFor,
  descId,
  title,
  description,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"
        aria-hidden
      >
        {icon}
      </div>
      <div>
        <Label htmlFor={htmlFor} className="text-foreground font-medium">
          {title}
        </Label>
        <p id={descId} className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
