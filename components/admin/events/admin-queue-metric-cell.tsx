export function AdminQueueMetricCell({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
