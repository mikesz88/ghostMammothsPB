import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TestControlAddGroupButton({
  loading,
  groupSize,
  onAddDefaultGroup,
}: {
  loading: boolean;
  groupSize: number;
  onAddDefaultGroup: () => void;
}) {
  return (
    <Button
      onClick={onAddDefaultGroup}
      disabled={loading}
      variant="outline"
      size="sm"
    >
      <Users className="w-4 h-4 mr-2" />
      Add {groupSize === 1 ? "Solo" : `Group of ${groupSize}`}
    </Button>
  );
}
