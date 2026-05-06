import { Mail } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { SettingsHubPageClientProps } from "@/lib/settings/settings-hub-page-types";

type Props = Pick<
  SettingsHubPageClientProps,
  "session" | "userDetails"
>;

export function SettingsHubAccountInfoNameEmail({ session, userDetails }: Props) {
  return (
    <>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Name</p>
        <p className="font-medium text-foreground">
          {userDetails?.name || session.metadataName || "Not set"}
        </p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Email</p>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <p className="font-medium text-foreground">{session.email}</p>
          {session.emailConfirmedAt ? (
            <Badge variant="outline" className="text-xs">
              Verified
            </Badge>
          ) : null}
        </div>
      </div>
    </>
  );
}
