export default function AiLoading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="size-5 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted/70" />
        <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted/70" />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-lg bg-muted/60" />
          <div className="h-16 animate-pulse rounded-lg bg-muted/40" />
          <div className="h-12 animate-pulse rounded-lg bg-muted/40" />
        </div>
        <div className="mt-4 h-10 animate-pulse rounded-md bg-muted/60" />
      </div>
    </div>
  );
}
