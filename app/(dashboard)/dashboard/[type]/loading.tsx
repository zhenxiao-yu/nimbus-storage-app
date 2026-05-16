export default function TypeLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-baseline gap-3">
          <div className="h-9 w-44 animate-pulse rounded-md bg-muted" />
          <div className="h-5 w-10 animate-pulse rounded-full bg-muted/70" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-48 animate-pulse rounded-md bg-muted/70" />
          <div className="h-9 w-40 animate-pulse rounded-md bg-muted/70" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex h-48 flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-soft"
          >
            <div className="flex items-start justify-between">
              <div className="size-16 animate-pulse rounded-xl bg-muted" />
              <div className="size-8 animate-pulse rounded-md bg-muted/60" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted/70" />
            </div>
            <div className="mt-auto h-3 w-24 animate-pulse rounded bg-muted/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
