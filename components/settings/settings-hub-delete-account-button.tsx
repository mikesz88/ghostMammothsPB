import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  deleteLoading: boolean;
  onDeleteAccount: () => void;
};

export function SettingsHubDeleteAccountButton({
  deleteLoading,
  onDeleteAccount,
}: Props) {
  return (
    <Button
      variant="destructive"
      onClick={onDeleteAccount}
      disabled={deleteLoading}
      className="w-full"
    >
      {deleteLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Deleting account...
        </>
      ) : (
        "Delete account"
      )}
    </Button>
  );
}
