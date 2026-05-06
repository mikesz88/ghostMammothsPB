import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Props = {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: () => void;
};

export function SettingsNotificationsTypeSwitchRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor={id} className="text-foreground font-medium">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
