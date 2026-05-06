export function AdminEventHeaderCounts({
  waitingCount,
  playingCount,
}: {
  waitingCount: number;
  playingCount: number;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="text-sm text-muted-foreground">
          {waitingCount} Waiting
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-sm text-muted-foreground">
          {playingCount} Playing
        </span>
      </div>
    </div>
  );
}
