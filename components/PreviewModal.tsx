"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Models } from "node-appwrite";
import { Download, ExternalLink, Loader2, X } from "lucide-react";

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

function PreviewBody({ file }: { file: Models.DefaultDocument }) {
  const type = (file.type as string) ?? "other";
  const extension = ((file.extension as string) ?? "").toLowerCase();
  const url = file.url as string;

  if (type === "image") {
    // Prefer the 1024px preview over the full original — way less bandwidth
    // for the same on-screen result, and Appwrite serves webp by default.
    // Falls back to the raw URL if the bucket ID isn't available.
    const previewSrc = file.bucketFileId
      ? constructPreviewUrl(file.bucketFileId as string, {
          width: 1024,
          height: 1024,
          quality: 90,
        })
      : url;
    return (
      <div className="flex w-full items-center justify-center rounded-lg bg-black/80 p-2 sm:p-4">
        <Image
          src={previewSrc}
          alt={file.name}
          width={1024}
          height={1024}
          unoptimized
          className="max-h-[70vh] w-auto object-contain"
        />
      </div>
    );
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
