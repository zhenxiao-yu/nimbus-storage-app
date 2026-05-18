export default function BeamLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="h-4 w-32 animate-pulse rounded bg-muted/70" />
      <div className="space-y-3">
        <div className="h-6 w-40 animate-pulse rounded-full bg-muted/70" />
        <div className="h-9 w-3/4 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted/70" />
      </div>
      <div className="space-y-5 rounded-2xl border border-border/60 bg-card p-8 shadow-soft">
        <div className="mx-auto h-4 w-56 animate-pulse rounded bg-muted/70" />
        <div className="mx-auto h-20 w-72 animate-pulse rounded-lg bg-muted" />
        <div className="mx-auto h-10 w-32 animate-pulse rounded-md bg-muted/70" />
      </div>
    </div>
  );
}
