"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Models } from "node-appwrite";
import {
  Download,
  ExternalLink,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import {
  cn,
  constructDownloadUrl,
  constructPreviewUrl,
  formatDateTime,
  convertFileSize,
} from "@/lib/utils";
import { isAiEnabled, summarizeFile } from "@/lib/actions/ai.actions";

interface PreviewModalProps {
  file: Models.DefaultDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeChipStyles: Record<string, string> = {
  document:
    "bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-300",
  image:
    "bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-300",
  video: "bg-pink-500/10 text-pink-600 ring-pink-500/20 dark:text-pink-300",
  audio: "bg-pink-500/10 text-pink-600 ring-pink-500/20 dark:text-pink-300",
  other:
    "bg-zinc-500/10 text-zinc-600 ring-zinc-500/20 dark:text-zinc-300",
};

const typeLabel: Record<string, string> = {
  document: "Doc",
  image: "Image",
  video: "Media",
  audio: "Media",
  other: "Other",
};

const TEXT_EXTENSIONS = new Set(["txt", "md", "csv", "json", "log"]);
const PDF_EXTENSIONS = new Set(["pdf"]);
const AI_SUMMARIZABLE_EXTENSIONS = new Set([
  "txt",
  "md",
  "markdown",
  "csv",
  "json",
  "log",
]);

/**
 * Inline summarize panel. Lives below the preview body and above the
 * footer. Hidden when AI isn't configured on this deploy or the file's
 * extension can't be summarized.
 */
function AiSummaryPanel({ file }: { file: Models.DefaultDocument }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "ready"; summary: string }
    | { status: "error"; message: string }
  >({ status: "idle" });

  useEffect(() => {
    // Reset when the file changes so reopening on a different file
    // doesn't keep the previous summary visible.
    setState({ status: "idle" });
  }, [file.$id]);

  useEffect(() => {
    let cancelled = false;
    isAiEnabled()
      .then((on) => {
        if (!cancelled) setEnabled(on);
      })
      .catch(() => {
        if (!cancelled) setEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const extension = ((file.extension as string) ?? "").toLowerCase();
  const eligible = AI_SUMMARIZABLE_EXTENSIONS.has(extension);

  if (!enabled || !eligible) return null;

  const handleSummarize = async () => {
    setState({ status: "loading" });
    try {
      const result = await summarizeFile({ fileId: file.$id });
      setState({ status: "ready", summary: result.summary });
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Couldn't summarize this file.";
      setState({ status: "error", message });
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-border/60 bg-gradient-to-br from-violet-500/5 via-transparent to-sky-500/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles aria-hidden="true" className="size-4 text-primary" />
          <p className="text-sm font-medium">AI summary</p>
        </div>
        {state.status !== "ready" && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSummarize}
            disabled={state.status === "loading"}
          >
            {state.status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                Summarizing…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Summarize with AI
              </>
            )}
          </Button>
        )}
      </div>

      {state.status === "idle" && (
        <p className="mt-2 text-xs text-muted-foreground">
          Generate a short, factual summary of this file using Claude.
        </p>
      )}
      {state.status === "loading" && (
        <p className="mt-2 text-xs text-muted-foreground">
          Reading the file and asking the model…
        </p>
      )}
      {state.status === "error" && (
        <p className="mt-2 text-xs text-destructive">{state.message}</p>
      )}
      {state.status === "ready" && (
        <div className="mt-3 space-y-2">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {state.summary}
          </p>
          <button
            type="button"
            onClick={handleSummarize}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline focus-visible:underline"
          >
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
}

function FallbackBody({
  extension,
  url,
}: {
  extension: string;
  url: string;
}) {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4 rounded-lg bg-muted/40 p-6 text-center">
      <p className="text-sm text-muted-foreground">
        Preview not available for{" "}
        <span className="font-mono">.{extension || "this"}</span> files
      </p>
      <Button asChild variant="secondary" size="sm">
        <a href={url} target="_blank" rel="noreferrer noopener">
          <ExternalLink className="size-4" />
          Open in new tab
        </a>
      </Button>
    </div>
  );
}

function TextPreview({ url }: { url: string }) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "ready"; text: string }
    | { status: "error" }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.text();
      })
      .then((text) => {
        if (!cancelled) {
          // Cap very large files at ~500KB to keep the DOM healthy.
          const trimmed =
            text.length > 500_000
              ? text.slice(0, 500_000) + "\n\n…[truncated]"
              : text;
          setState({ status: "ready", text: trimmed });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (state.status === "loading") {
    return (
      <div className="flex h-[50vh] items-center justify-center rounded-lg bg-muted/40">
        <Loader2
          className="size-6 animate-spin text-muted-foreground motion-reduce:animate-none"
          aria-label="Loading preview"
        />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3 rounded-lg bg-muted/40 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Couldn&apos;t load preview
        </p>
        <Button asChild variant="secondary" size="sm">
          <a href={url} target="_blank" rel="noreferrer noopener">
            <ExternalLink className="size-4" />
            Open in new tab
          </a>
        </Button>
      </div>
    );
  }

  return (
    <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border/60 bg-muted/30 p-4 font-mono text-xs leading-relaxed">
      {state.text}
    </pre>
  );
}

function ImagePreview({ file }: { file: Models.DefaultDocument }) {
  const url = file.url as string;
  const bucketFileId = file.bucketFileId as string | undefined;
  const previewSrc = bucketFileId
    ? constructPreviewUrl(bucketFileId, { width: 1024, height: 1024, quality: 90 })
    : url;
  const [src, setSrc] = useState(previewSrc);
  return (
    <div className="flex w-full items-center justify-center rounded-lg bg-black/80 p-2 sm:p-4">
      <Image
        src={src}
        alt={(file.name as string) ?? "Image preview"}
        width={1024}
        height={1024}
        unoptimized
        onError={() => {
          if (src !== url) setSrc(url);
        }}
        className="max-h-[70vh] w-auto object-contain"
      />
    </div>
  );
}

function PreviewBody({ file }: { file: Models.DefaultDocument }) {
  const type = (file.type as string) ?? "other";
  const extension = ((file.extension as string) ?? "").toLowerCase();
  const url = file.url as string;

  if (type === "image") {
    return <ImagePreview file={file} />;
  }

  if (type === "video") {
    return (
      <div className="flex w-full items-center justify-center rounded-lg bg-black/80 p-2 sm:p-4">
        <video
          controls
          preload="metadata"
          src={url}
          className="max-h-[70vh] w-full rounded-md"
        >
          <track kind="captions" />
        </video>
      </div>
    );
  }

  if (type === "audio") {
    return (
      <div className="flex flex-col items-center gap-6 rounded-lg bg-gradient-to-br from-violet-500/10 via-indigo-500/10 to-sky-500/10 p-6 sm:p-10">
        <div className="relative flex size-40 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 shadow-elevated sm:size-56">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent"
          />
          <p className="relative line-clamp-3 px-6 text-center text-sm font-medium text-white drop-shadow-sm">
            {file.name}
          </p>
        </div>
        <audio controls src={url} className="w-full max-w-md">
          <track kind="captions" />
        </audio>
      </div>
    );
  }

  if (type === "document" && PDF_EXTENSIONS.has(extension)) {
    return (
      <iframe
        src={url}
        title={file.name}
        className="h-[70vh] w-full rounded-lg border border-border/60 bg-muted/30 sm:h-[75vh]"
      />
    );
  }

  if (type === "document" && TEXT_EXTENSIONS.has(extension)) {
    return <TextPreview url={url} />;
  }

  return <FallbackBody extension={extension} url={url} />;
}

export function PreviewModal({ file, open, onOpenChange }: PreviewModalProps) {
  if (!file) return null;

  const type = (file.type as string) ?? "other";
  const chipClass = typeChipStyles[type] ?? typeChipStyles.other;
  const chipText = typeLabel[type] ?? "File";
  const downloadHref = constructDownloadUrl(file.bucketFileId as string);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "motion-reduce:transition-none motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none",
          )}
        />
        <DialogContent
          // Override the default shadcn max-w-lg and padding so we can host
          // a true preview canvas. Keep the centering / a11y wiring intact.
          className={cn(
            "left-[50%] top-[50%] w-full translate-x-[-50%] translate-y-[-50%] gap-0 overflow-hidden rounded-xl border border-border/60 bg-card p-0 shadow-elevated",
            "max-w-[calc(100vw-1rem)] sm:max-w-3xl lg:max-w-4xl",
            "motion-reduce:transition-none motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none",
          )}
          onOpenAutoFocus={(e) => {
            // Let Radix handle focus trap; prevent it from auto-focusing the
            // first focusable, which would scroll iframes/videos into view.
            e.preventDefault();
          }}
        >
          <header className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset",
                    chipClass,
                  )}
                >
                  {chipText}
                </span>
                <DialogTitle className="min-w-0 truncate text-sm font-semibold sm:text-base">
                  {file.name}
                </DialogTitle>
              </div>
              <DialogDescription className="truncate text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70 tabular-nums">
                  {convertFileSize(file.size as number)}
                </span>
                <span className="mx-1.5 text-border">·</span>
                <span>Uploaded {formatDateTime(file.$createdAt)}</span>
              </DialogDescription>
            </div>
            <DialogPrimitive.Close
              aria-label="Close preview"
              className="ring-focus inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </header>

          <div className="max-h-[80vh] overflow-auto p-4 sm:p-6">
            <PreviewBody file={file} />
            <AiSummaryPanel file={file} />
          </div>

          <footer className="flex flex-col-reverse items-stretch gap-2 border-t border-border/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span className="hidden text-[11px] text-muted-foreground sm:inline">
              Press{" "}
              <kbd className="rounded border border-border/70 bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                Esc
              </kbd>{" "}
              to close
            </span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button asChild variant="ghost" size="sm">
                <a
                  href={file.url as string}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <ExternalLink className="size-4" />
                  Open in new tab
                </a>
              </Button>
              <Button asChild size="sm">
                <a
                  href={downloadHref}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Download className="size-4" />
                  Download
                </a>
              </Button>
            </div>
          </footer>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export default PreviewModal;
