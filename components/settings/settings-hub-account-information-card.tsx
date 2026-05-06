import { SettingsHubAccountInformationBody } from "@/components/settings/settings-hub-account-information-body";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { SettingsHubPageClientProps } from "@/lib/settings/settings-hub-page-types";

type Props = Pick<
  SettingsHubPageClientProps,
  "session" | "userDetails"
>;

export function SettingsHubAccountInformationCard({
  session,
  userDetails,
}: Props) {
  return (
    <Card className="border-border mb-6">
      <CardHeader>
        <CardTitle className="text-foreground">Account Information</CardTitle>
        <CardDescription>Your profile details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingsHubAccountInformationBody
          session={session}
          userDetails={userDetails}
        />
      </CardContent>
    </Card>
  );
}
