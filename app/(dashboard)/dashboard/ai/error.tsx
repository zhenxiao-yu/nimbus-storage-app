"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AiError({
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
      <h2 className="h3">We couldn&apos;t load Ask AI.</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        The assistant page hit an unexpected error. Your files are safe — only
        this view failed to render.
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
