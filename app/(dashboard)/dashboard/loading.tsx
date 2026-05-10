export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-44 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted/70" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-56 animate-pulse rounded-2xl bg-gradient-to-br from-violet-500/40 via-indigo-500/40 to-sky-500/40" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-border/60 bg-card"
            />
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-6">
        <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border/60 py-3 last:border-0"
          >
            <div className="size-12 animate-pulse rounded-xl bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
              <div className="h-3 w-1/3 animate-pulse rounded-md bg-muted/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
