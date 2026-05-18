"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function BeamReceiveError({
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
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <h1 className="h2">Something interrupted the beam.</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Refresh to try again, or head back to Nimbus.
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
    </div>
  );
}
