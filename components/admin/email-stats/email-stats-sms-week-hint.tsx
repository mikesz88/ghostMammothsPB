export function EmailStatsSmsWeekHint({ total }: { total: number }) {
  return (
    <p className="text-sm text-muted-foreground mt-4">
      Estimated monthly cost:{" "}
      <strong>${(total * 4 * 0.0075).toFixed(2)}</strong> -{" "}
      <strong>${(total * 4 * 0.02).toFixed(2)}</strong>
    </p>
  );
}
