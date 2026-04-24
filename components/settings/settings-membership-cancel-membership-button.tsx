import { Button } from "@/components/ui/button";

type Props = {
  actionLoading: boolean;
  onCancel: () => void;
};

export function SettingsMembershipCancelMembershipButton({
  actionLoading,
  onCancel,
}: Props) {
  return (
    <Button
      variant="destructive"
      className="flex-1"
      onClick={onCancel}
      disabled={actionLoading}
    >
      Cancel Membership
    </Button>
  );
}
