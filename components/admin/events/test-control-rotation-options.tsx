import { SelectContent, SelectItem } from "@/components/ui/select";

export function TestControlRotationOptions({
  teamSizeCap,
}: {
  teamSizeCap: number;
}) {
  return (
    <SelectContent>
      <SelectItem value="rotate-all">Rotate All</SelectItem>
      <SelectItem value="winners-stay">Winners Stay</SelectItem>
      <SelectItem value="2-stay-2-off" disabled={teamSizeCap !== 2}>
        2 Stay 2 Off
      </SelectItem>
    </SelectContent>
  );
}
