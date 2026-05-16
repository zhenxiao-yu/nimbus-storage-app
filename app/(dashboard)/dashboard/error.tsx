"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
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
      <h2 className="h3">We hit a snag loading your files.</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Check your connection and try again. If this keeps happening, your
        Appwrite session may have expired — sign out and back in.
      </p>
      <Button onClick={reset} className="mt-2">
        <RefreshCw aria-hidden="true" className="mr-2 size-4" />
        Retry
      </Button>
    </div>
  );
}
