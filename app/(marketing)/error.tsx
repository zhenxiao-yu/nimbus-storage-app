"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function MarketingError({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center sm:px-6">
      <h2 className="h3">Something went wrong loading this page.</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        It&apos;s probably a temporary glitch. Try again, or head back home.
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
            Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
