export default function TrashLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-baseline gap-3">
          <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
          <div className="h-5 w-10 animate-pulse rounded-full bg-muted/70" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-64 animate-pulse rounded-md bg-muted/70" />
          <div className="h-9 w-32 animate-pulse rounded-md bg-muted/70" />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-2 shadow-soft">
        <div className="divide-y divide-border/60">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="size-12 animate-pulse rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted/70" />
              </div>
              <div className="h-8 w-20 animate-pulse rounded-md bg-muted/60" />
              <div className="h-8 w-24 animate-pulse rounded-md bg-muted/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
