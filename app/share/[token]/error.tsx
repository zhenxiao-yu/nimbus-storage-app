"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ShareError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center sm:px-6">
      <h1 className="h2">We couldn&apos;t load this share.</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The link may be temporarily unavailable. Try again, or visit Nimbus to
        create your own workspace.
      </p>
      {error?.digest && (
        <p className="font-mono text-xs text-muted-foreground/70">
          {error.digest}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>
          <RefreshCw aria-hidden="true" className="mr-2 size-4" />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Home aria-hidden="true" className="mr-2 size-4" />
            Go to Nimbus
          </Link>
        </Button>
      </div>
    </main>
  );
}
