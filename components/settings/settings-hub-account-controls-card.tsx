import { SettingsHubDeleteAccountButton } from "@/components/settings/settings-hub-delete-account-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  deleteLoading: boolean;
  onDeleteAccount: () => void;
};

export function SettingsHubAccountControlsCard({
  deleteLoading,
  onDeleteAccount,
}: Props) {
  return (
    <Card className="border-border mt-6">
      <CardHeader>
        <CardTitle className="text-foreground">Account Controls</CardTitle>
        <CardDescription>
          Manage the status of your account and data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Deleting your account will immediately cancel access, remove your
          profile from events, and permanently erase your membership history.
        </p>
        <SettingsHubDeleteAccountButton
          deleteLoading={deleteLoading}
          onDeleteAccount={onDeleteAccount}
        />
      </CardContent>
    </Card>
  );
}
