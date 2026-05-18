export default function BeamReceiveLoading() {
  return (
    <div className="flex flex-1 flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-44 animate-pulse rounded-full bg-muted/70" />
        <div className="h-9 w-56 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted/70" />
      </div>
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-border/60 bg-card p-8 shadow-soft">
        <div className="mx-auto h-5 w-40 animate-pulse rounded bg-muted/70" />
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="size-14 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
        <div className="h-10 w-full animate-pulse rounded-md bg-muted/70" />
      </div>
    </div>
  );
}
