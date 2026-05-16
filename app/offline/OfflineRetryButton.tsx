"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function OfflineRetryButton() {
  return (
    <Button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") window.location.reload();
      }}
    >
      <RefreshCw aria-hidden="true" className="mr-2 size-4" />
      Retry
    </Button>
  );
}
