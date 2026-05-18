"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function FolderError({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <h2 className="h3">We couldn&apos;t open this folder.</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        The folder may have been moved or deleted, or your session expired.
        Refresh and try again.
      </p>
      {error?.digest && (
        <p className="font-mono text-xs text-muted-foreground/70">
          {error.digest}
        </p>
      )}
      <Button onClick={reset} className="mt-2">
        <RefreshCw aria-hidden="true" className="mr-2 size-4" />
        Retry
      </Button>
    </div>
  );
}
