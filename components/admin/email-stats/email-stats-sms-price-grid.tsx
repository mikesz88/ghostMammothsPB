export function EmailStatsSmsPriceGrid({ total }: { total: number }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">
          Low Estimate ($0.0075/SMS)
        </p>
        <p className="text-2xl font-bold text-foreground">
          ${(total * 0.0075).toFixed(2)}
        </p>
      </div>
      <div className="p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">
          High Estimate ($0.02/SMS)
        </p>
        <p className="text-2xl font-bold text-foreground">
          ${(total * 0.02).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
