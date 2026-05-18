import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import AiChat from "@/components/AiChat";
import { AI_ENABLED } from "@/lib/env";

export const metadata: Metadata = {
  title: "Ask AI",
  description:
    "Ask Claude factual questions about the files in your Nimbus workspace.",
  alternates: { canonical: "/dashboard/ai" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AiPage() {
  if (!AI_ENABLED) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Sparkles aria-hidden="true" className="size-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h1 className="h3">AI is not configured on this deploy.</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            The Ask AI workspace assistant is disabled because no Anthropic
            API key is configured. Add{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              ANTHROPIC_API_KEY
            </code>{" "}
            to your environment and redeploy to enable it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles aria-hidden="true" className="size-5 text-primary" />
          <h1 className="h1">Ask AI</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Claude can answer factual questions about the files in your workspace
          — names, types, sizes, upload dates, and folders. It doesn&apos;t
          read file contents from here; for that, use the Summarize button in
          the file preview.
        </p>
      </header>

      <AiChat />
    </div>
  );
}
