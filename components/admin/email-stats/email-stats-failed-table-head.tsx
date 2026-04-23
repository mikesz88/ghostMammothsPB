export function EmailStatsFailedTableHead() {
  return (
    <thead>
      <tr className="border-b border-border bg-muted/40 text-left">
        <th className="p-3 font-medium">When</th>
        <th className="p-3 font-medium">Type</th>
        <th className="p-3 font-medium">Player</th>
        <th className="p-3 font-medium">Event</th>
        <th className="p-3 font-medium">Error</th>
        <th className="p-3 font-medium w-[120px]">Action</th>
      </tr>
    </thead>
  );
}
