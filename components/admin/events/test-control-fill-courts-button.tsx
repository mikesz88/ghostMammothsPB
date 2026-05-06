import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TestControlFillCourtsButton({
  loading,
  onFillAllCourts,
}: {
  loading: boolean;
  onFillAllCourts: () => void;
}) {
  return (
    <Button
      onClick={onFillAllCourts}
      disabled={loading}
      variant="outline"
      size="sm"
      className="col-span-2"
    >
      <Play className="w-4 h-4 mr-2" />
      Fill All Courts
    </Button>
  );
}
