import { SelectContent, SelectItem } from "@/components/ui/select";

export function TestControlGroupSizeOptions({
  teamSizeCap,
}: {
  teamSizeCap: number;
}) {
  return (
    <SelectContent>
      <SelectItem value="1">Solo (1 player)</SelectItem>
      {teamSizeCap >= 2 ? (
        <SelectItem value="2">Duo (2 players)</SelectItem>
      ) : null}
      {teamSizeCap >= 3 ? (
        <SelectItem value="3">Triple (3 players)</SelectItem>
      ) : null}
      {teamSizeCap >= 4 ? (
        <SelectItem value="4">Quad (4 players)</SelectItem>
      ) : null}
    </SelectContent>
  );
}
