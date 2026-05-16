import type { Metadata } from "next";
import Link from "next/link";

import OfflineRetryButton from "./OfflineRetryButton";

export const metadata: Metadata = {
  title: "Offline",
  description:
    "You're offline. Reconnect to see your latest files in Nimbus.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 sm:px-6">
      <div className="relative z-10 flex max-w-md flex-col items-center gap-6 text-center">
        <div
          aria-hidden="true"
          className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 shadow-lg"
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
            aria-label="Nimbus"
          >
            <path d="M17 17H7a4 4 0 1 1 1.2-7.8A5.5 5.5 0 0 1 18.8 9 4 4 0 0 1 17 17Z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            You&apos;re offline
          </h1>
          <p className="text-balance text-muted-foreground">
            Reconnect to see your latest files. Some pages you&apos;ve already
            visited may still be available from the cache.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <OfflineRetryButton />
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Go to home
          </Link>
        </div>
      </div>
    </main>
  );
}
