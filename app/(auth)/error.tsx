"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AuthError({
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
    <div className="flex min-h-[60vh] w-full max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
      <h2 className="h3">Sign-in is having a moment.</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        We couldn&apos;t load the auth form. Try again, or come back in a
        minute.
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
