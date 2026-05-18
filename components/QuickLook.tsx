"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Models } from "node-appwrite";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Loader2 } from "lucide-react";

import dynamic from "next/dynamic";
const PreviewModal = dynamic(() => import("@/components/PreviewModal"), {
  ssr: false,
});
import { useMultiSelect } from "@/components/MultiSelectProvider";
import { useQuickLookStrict } from "@/components/QuickLookProvider";
import { Button } from "@/components/ui/button";
import {
  cn,
  constructPreviewUrl,
  convertFileSize,
  formatRelativeTime,
} from "@/lib/utils";

interface QuickLookProps {
  /**
   * The files currently rendered in the surrounding grid. Used to resolve
   * orderedIds (from MultiSelectProvider) back into full file documents for
   * arrow-key navigation.
   */
  files: Models.DefaultDocument[];
}

const typeChipStyles: Record<string, string> = {
  document: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  image: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  video: "bg-pink-500/15 text-pink-300 ring-pink-500/30",
  audio: "bg-pink-500/15 text-pink-300 ring-pink-500/30",
  other: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
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

/**
 * Quick Look body — intentionally parallel to PreviewModal's `PreviewBody`,
 * not imported. Lets us tune sizing/styling for the lighter "peek" surface
 * without risking a regression in the full modal. Anything beyond a peek
 * (downloads, open-in-new-tab, etc.) is delegated to PreviewModal when the
 * user clicks the content.
 */
function QuickLookBody({ file }: { file: Models.DefaultDocument }) {
  const type = (file.type as string) ?? "other";
  const extension = ((file.extension as string) ?? "").toLowerCase();
  const url = file.url as string;
  const bucketFileId = file.bucketFileId as string | undefined;

  if (type === "image") {
    const previewSrc = bucketFileId
      ? constructPreviewUrl(bucketFileId, { width: 1400, height: 1400, quality: 88 })
      : url;
    return (
      <Image
        src={previewSrc}
        alt={(file.name as string) ?? "Image preview"}
        width={1400}
        height={1400}
        unoptimized
        className="max-h-[72vh] w-auto rounded-md object-contain"
      />
    );
  }

  if (type === "video") {
    return (
      <video
        controls
        preload="metadata"
        src={url}
        className="max-h-[72vh] w-full rounded-md bg-black"
      >
        <track kind="captions" />
      </video>
    );
  }

  if (type === "audio") {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-lg bg-gradient-to-br from-violet-500/20 via-indigo-500/20 to-sky-500/20 p-8">
        <div className="flex size-40 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 shadow-elevated">
          <p className="line-clamp-3 px-4 text-center text-sm font-medium text-white">
            {file.name}
          </p>
        </div>
        <audio controls src={url} className="w-full">
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
        className="h-[72vh] w-[min(900px,90vw)] rounded-md border border-white/10 bg-white"
      />
    );
  }

  if (type === "document" && TEXT_EXTENSIONS.has(extension)) {
    return <TextPeek url={url} />;
  }

  return (
    <div className="flex h-[40vh] w-[min(640px,90vw)] flex-col items-center justify-center gap-4 rounded-md bg-white/5 p-6 text-center text-white/80">
      <p className="text-sm">
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

function TextPeek({ url }: { url: string }) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "ready"; text: string }
    | { status: "error" }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    // URL-driven fetch; loading state resets when url prop changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: "loading" });
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.text();
      })
      .then((text) => {
        if (cancelled) return;
        const trimmed =
          text.length > 200_000
            ? text.slice(0, 200_000) + "\n\n…[truncated]"
            : text;
        setState({ status: "ready", text: trimmed });
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
      <div className="flex h-[50vh] w-[min(900px,90vw)] items-center justify-center rounded-md bg-white/5">
        <Loader2
          className="size-6 animate-spin text-white/60 motion-reduce:animate-none"
          aria-label="Loading preview"
        />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex h-[40vh] w-[min(900px,90vw)] items-center justify-center rounded-md bg-white/5 text-sm text-white/70">
        Couldn&apos;t load preview
      </div>
    );
  }

  return (
    <pre className="max-h-[72vh] w-[min(900px,90vw)] overflow-auto whitespace-pre-wrap break-words rounded-md border border-white/10 bg-white/5 p-4 font-mono text-xs leading-relaxed text-white/90">
      {state.text}
    </pre>
  );
}

const QUICKLOOK_HINT_KEY = "nimbus:quicklook:hold-hint-seen";

export function QuickLook({ files }: QuickLookProps) {
  const ql = useQuickLookStrict();
  const multi = useMultiSelect();
  const reducedMotion = useReducedMotion();

  // Track which DOM element opened Quick Look so we can restore focus to it
  // when the overlay closes — important for keyboard users.
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  // Full PreviewModal handoff: when the user clicks the Quick Look content,
  // we close the peek and open the full modal on the same file.
  const [fullPreview, setFullPreview] = useState<Models.DefaultDocument | null>(
    null,
  );
  const [showHoldHint, setShowHoldHint] = useState(false);

  const fileById = useMemo(() => {
    const map = new Map<string, Models.DefaultDocument>();
    for (const f of files) map.set(f.$id, f);
    return map;
  }, [files]);

  const open = ql.open;
  const file = ql.file;
  const orderedIds = useMemo(
    () => multi?.orderedIds ?? [],
    [multi?.orderedIds],
  );

  const currentIndex = useMemo(() => {
    if (!file) return -1;
    return orderedIds.indexOf(file.$id);
  }, [file, orderedIds]);

  // First-time touch users get a tiny hint. We don't want to render it on
  // SSR, hence the effect.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch =
      "ontouchstart" in window ||
      (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);
    if (!isTouch) return;
    try {
      if (!window.localStorage.getItem(QUICKLOOK_HINT_KEY)) {
        // Client-only: hint visibility depends on localStorage which can't run during SSR.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowHoldHint(true);
      }
    } catch {
      // localStorage unavailable (private mode etc.) — silently skip hint.
    }
  }, []);

  const dismissHoldHint = useCallback(() => {
    setShowHoldHint(false);
    try {
      window.localStorage.setItem(QUICKLOOK_HINT_KEY, "1");
    } catch {
      // ignore — best-effort
    }
  }, []);

  // Global keyboard listener: Space opens, ←/→ navigate, Esc/Space close.
  // Mounted once at the FileGrid level (since QuickLook is mounted there).
  useEffect(() => {
    function isTypingTarget(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (target.isContentEditable) return true;
      return false;
    }

    function onKeyDown(e: KeyboardEvent) {
      // Never intercept typing.
      if (isTypingTarget(e.target)) return;
      // Don't fight other shortcut handlers (e.g. command palette).
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (open) {
        if (e.key === "Escape" || e.code === "Space" || e.key === " ") {
          e.preventDefault();
          ql.closeQuickLook();
          return;
        }
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          if (orderedIds.length === 0) return;
          e.preventDefault();
          const dir = e.key === "ArrowRight" ? 1 : -1;
          const fromIndex = currentIndex < 0 ? 0 : currentIndex;
          const nextIndex =
            (fromIndex + dir + orderedIds.length) % orderedIds.length;
          const nextId = orderedIds[nextIndex];
          const next = fileById.get(nextId);
          if (next) ql.setFile(next);
          return;
        }
        return;
      }

      // Closed → maybe open.
      if (e.code === "Space" || e.key === " ") {
        // Pick the focused / last-clicked id; fall back to the first item in
        // the current view.
        const targetId =
          (multi?.lastClickedId && orderedIds.includes(multi.lastClickedId)
            ? multi.lastClickedId
            : null) ?? orderedIds[0] ?? null;
        if (!targetId) return;
        const target = fileById.get(targetId);
        if (!target) return;
        e.preventDefault();
        // Remember the element that opened us so we can restore focus.
        if (document.activeElement instanceof HTMLElement) {
          restoreFocusRef.current = document.activeElement;
        }
        ql.openQuickLook(target);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ql, open, orderedIds, currentIndex, fileById, multi]);

  // Restore focus to the originating card on close.
  useEffect(() => {
    if (open) return;
    const el = restoreFocusRef.current;
    if (el && document.body.contains(el)) {
      el.focus({ preventScroll: true });
    }
    restoreFocusRef.current = null;
  }, [open]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // SSR safety for portal.
  const [mounted, setMounted] = useState(false);
  // SSR safety for portal — flip after first client render.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const type = (file?.type as string) ?? "other";
  const chipClass = typeChipStyles[type] ?? typeChipStyles.other;
  const chipText = typeLabel[type] ?? "File";

  const handleContentClick = () => {
    if (!file) return;
    setFullPreview(file);
    ql.closeQuickLook();
  };

  const overlay = (
    <AnimatePresence>
      {open && file && (
        <motion.div
          key="quicklook-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={
            reducedMotion ? { duration: 0 } : { duration: 0.15, ease: "easeOut" }
          }
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={(e) => {
            // Backdrop click closes; clicks bubbling from the content card
            // are stopped below.
            if (e.target === e.currentTarget) ql.closeQuickLook();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Quick Look: ${file.name}`}
        >
          <motion.button
            type="button"
            initial={
              reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }
            }
            animate={{ opacity: 1, scale: 1 }}
            exit={
              reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }
            }
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 340, damping: 28 }
            }
            onClick={(e) => {
              e.stopPropagation();
              handleContentClick();
            }}
            className={cn(
              "ring-focus relative flex max-h-[82vh] max-w-[92vw] flex-col items-center justify-center gap-3 rounded-xl bg-transparent p-2 text-left focus:outline-none",
              "cursor-zoom-in",
            )}
            aria-label={`Open ${file.name} in full preview`}
          >
            <span
              className={cn(
                "absolute left-3 top-3 z-10 inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset",
                chipClass,
              )}
            >
              {chipText}
            </span>
            <div className="flex items-center justify-center">
              <QuickLookBody file={file} />
            </div>
          </motion.button>

          <div className="pointer-events-none mt-6 flex max-w-[92vw] flex-col items-center gap-1 text-center text-white">
            <p className="line-clamp-1 text-sm font-semibold sm:text-base">
              {file.name}
            </p>
            <p className="text-xs text-white/60">
              <span className="font-medium text-white/80 tabular-nums">
                {convertFileSize(file.size as number)}
              </span>
              <span className="mx-1.5 text-white/30">·</span>
              <span>{formatRelativeTime(file.$createdAt)}</span>
              {orderedIds.length > 1 && currentIndex >= 0 && (
                <>
                  <span className="mx-1.5 text-white/30">·</span>
                  <span className="tabular-nums">
                    {currentIndex + 1} of {orderedIds.length}
                  </span>
                </>
              )}
            </p>
          </div>

          <p className="pointer-events-none mt-4 hidden text-[11px] text-white/50 sm:block">
            <kbd className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">
              ←
            </kbd>{" "}
            <kbd className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">
              →
            </kbd>{" "}
            to flip ·{" "}
            <kbd className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">
              Space
            </kbd>{" "}
            or{" "}
            <kbd className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">
              Esc
            </kbd>{" "}
            to close · Click to open full modal
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {createPortal(overlay, document.body)}
      {showHoldHint &&
        createPortal(
          <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit max-w-[90vw] items-center gap-3 rounded-full border border-border/60 bg-background/95 px-4 py-2 text-xs text-foreground shadow-soft backdrop-blur">
            <span>Tip: hold any file to peek</span>
            <button
              type="button"
              onClick={dismissHoldHint}
              className="ring-focus rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground focus:outline-none"
            >
              Got it
            </button>
          </div>,
          document.body,
        )}
      <PreviewModal
        file={fullPreview}
        open={Boolean(fullPreview)}
        onOpenChange={(v) => {
          if (!v) setFullPreview(null);
        }}
      />
    </>
  );
}

export default QuickLook;
