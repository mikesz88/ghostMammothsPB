export function EventDetailStatTileText({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
