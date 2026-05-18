export default function ShareLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 md:px-6">
          <div className="h-7 w-28 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted/70" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 md:px-6 md:py-14">
        <div className="flex flex-col gap-3">
          <div className="h-6 w-32 animate-pulse self-start rounded-full bg-muted/70" />
          <div className="h-9 w-3/4 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-40 animate-pulse rounded bg-muted/70" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
          <div className="flex min-h-[280px] items-center justify-center bg-muted/30 p-6 sm:min-h-[380px]">
            <div className="size-24 animate-pulse rounded-2xl bg-muted" />
          </div>
          <div className="flex flex-col gap-3 border-t border-border/60 bg-background/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="h-3 w-56 animate-pulse rounded bg-muted/70" />
            <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </main>

      <footer className="border-t border-border/60 bg-background/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-4 md:px-6">
          <div className="h-3 w-40 animate-pulse rounded bg-muted/70" />
          <div className="h-3 w-48 animate-pulse rounded bg-muted/70" />
        </div>
      </footer>
    </div>
  );
}
