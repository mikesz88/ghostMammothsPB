import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  onSave: () => void;
};

export function SettingsNotificationsSaveButton({ onSave }: Props) {
  return (
    <Button onClick={onSave} size="lg" className="w-full">
      <Save className="w-4 h-4 mr-2" />
      Save Settings
    </Button>
  );
}
