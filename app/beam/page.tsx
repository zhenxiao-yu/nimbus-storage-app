import { Wifi } from "lucide-react";

import BeamReceiver from "@/components/BeamReceiver";

export default function BeamReceivePage() {
  return (
    <div className="flex flex-1 flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <Wifi aria-hidden="true" className="size-3.5 text-primary" />
          Beam — peer-to-peer transfer
        </span>
        <h1 className="h2">Receive a file</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Type the 4-digit code from the sender. The file streams directly into
          your browser — no upload, no server hop.
        </p>
      </div>

      <BeamReceiver />
    </div>
  );
}
