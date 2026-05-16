"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
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
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center sm:px-6">
      <h1 className="h2 mb-3">Something went wrong.</h1>
      <p className="mb-6 max-w-md text-muted-foreground">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      {error?.digest && (
        <p className="mb-6 font-mono text-xs text-muted-foreground/70">
          {error.digest}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>
          <RefreshCw aria-hidden="true" className="mr-2 size-4" /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Home aria-hidden="true" className="mr-2 size-4" /> Home
          </Link>
        </Button>
      </div>
    </main>
  );
}
