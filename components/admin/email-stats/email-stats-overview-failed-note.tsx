export function EmailStatsOverviewFailedNote({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <p className="text-xs text-muted-foreground mt-1 max-w-[14rem]">
      {count} other failure
      {count === 1 ? "" : "s"} (missing email, bad data) hidden below
    </p>
  );
}
