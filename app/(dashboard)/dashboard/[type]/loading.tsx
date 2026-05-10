export default function TypeLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-8 w-44 animate-pulse rounded-md bg-muted" />
        <div className="flex justify-between">
          <div className="h-4 w-48 animate-pulse rounded-md bg-muted/70" />
          <div className="h-9 w-40 animate-pulse rounded-md bg-muted/70" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-2xl border border-border/60 bg-card"
          />
        ))}
      </div>
    </div>
  );
}
