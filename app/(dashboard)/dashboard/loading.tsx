export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-9 w-44 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted/70" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="relative h-56 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/70 via-indigo-500/70 to-sky-500/70 shadow-glow">
          <div className="absolute -left-20 -top-20 size-72 animate-aurora rounded-full bg-fuchsia-400/30 blur-3xl" />
          <div className="absolute -bottom-24 -right-10 size-72 animate-aurora rounded-full bg-cyan-400/30 blur-3xl [animation-delay:-8s]" />
          <div className="relative grid h-full items-center gap-2 p-6 md:grid-cols-[200px_1fr]">
            <div className="mx-auto aspect-square w-full max-w-[180px] animate-pulse rounded-full bg-white/20" />
            <div className="space-y-2">
              <div className="h-5 w-40 animate-pulse rounded bg-white/30" />
              <div className="h-4 w-56 animate-pulse rounded bg-white/20" />
              <div className="mt-2 h-1.5 w-full animate-pulse rounded-full bg-white/15" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex h-44 flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-soft"
            >
              <div className="flex items-start justify-between">
                <div className="size-11 animate-pulse rounded-xl bg-muted" />
                <div className="size-4 animate-pulse rounded bg-muted/60" />
              </div>
              <div className="space-y-1.5">
                <div className="h-6 w-20 animate-pulse rounded bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted/70" />
              </div>
              <div className="h-1 w-full animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
        <div className="mb-4 space-y-1.5">
          <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
          <div className="h-3 w-56 animate-pulse rounded-md bg-muted/70" />
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <div className="size-12 animate-pulse rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
                </div>
                <div className="h-3 w-1/3 animate-pulse rounded-md bg-muted/70" />
              </div>
              <div className="size-8 animate-pulse rounded-md bg-muted/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
