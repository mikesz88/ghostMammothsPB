export function EmailStatsSmsTodayHint({ total }: { total: number }) {
  return (
    <p className="text-sm text-muted-foreground mt-4">
      If this daily rate continues, estimated monthly cost:{" "}
      <strong>${(total * 30 * 0.0075).toFixed(2)}</strong> -{" "}
      <strong>${(total * 30 * 0.02).toFixed(2)}</strong>
    </p>
  );
}
