"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Models } from "node-appwrite";
import { AnimatePresence, motion } from "framer-motion";
import {
  Download,
  FolderInput,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  deleteFile,
  moveFile,
  restoreFile,
} from "@/lib/actions/file.actions";
import { getFolders } from "@/lib/actions/folder.actions";
import {
  cn,
  constructDownloadUrl,
} from "@/lib/utils";
import { useMultiSelect } from "@/components/MultiSelectProvider";
import { Folder as FolderIcon, Home } from "lucide-react";

interface BulkActionsBarProps {
  files: Models.DefaultDocument[];
}

/**
 * Floating action bar that appears whenever the multi-select context has at
 * least one file selected. Provides bulk Download, Move, and Trash actions
 * plus a Clear button. Escape clears the selection.
 *
 * Implementation notes:
 *
 * - We loop the existing single-file server actions client-side rather than
 *   adding a bulk server action. This keeps the schema + types stable and
 *   means error handling matches the single-file path. The trade-off is N
 *   round-trips; for portfolio-scale selections (dozens, not thousands)
 *   that's totally fine.
 *
 * - Downloads: opening many URLs with `window.open` in a tight loop is
 *   reliably blocked by browsers. We space them with a 200 ms gap, which
 *   most browsers tolerate, and warn the user via toast. Real zip-in-
 *   browser would need JSZip — explicitly out of scope (no new deps).
 */
export function BulkActionsBar({ files }: BulkActionsBarProps) {
  const multi = useMultiSelect();
  const path = usePathname();
  const [isPending, startTransition] = useTransition();
  const [moveOpen, setMoveOpen] = useState(false);

  const selectedIds = multi?.selectedIds ?? new Set<string>();
  const count = multi?.selectedCount ?? 0;

  // Escape clears the selection. Bound at the window level so the user can
  // hit Esc from anywhere on the page — not just when the bar is focused.
  useEffect(() => {
    if (!multi || count === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        multi.clear();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [multi, count]);

  if (!multi || count === 0) return null;

  const selectedFiles = files.filter((f) => selectedIds.has(f.$id));

  const handleDownload = () => {
    toast.info(
      `Starting ${selectedFiles.length} download${
        selectedFiles.length === 1 ? "" : "s"
      }…`,
      {
        description: "Your browser may prompt to allow multiple downloads.",
      },
    );
    selectedFiles.forEach((file, i) => {
      // Stagger to dodge most browsers' "this site is trying to download
      // multiple files" rate limit. Not perfect but good enough for a demo.
      setTimeout(() => {
        const href = constructDownloadUrl(file.bucketFileId as string);
        window.open(href, "_blank", "noopener,noreferrer");
      }, i * 200);
    });
  };

  const handleTrash = () => {
    const snapshot = selectedFiles.map((f) => ({ id: f.$id, name: f.name }));
    startTransition(async () => {
      const results = await Promise.allSettled(
        snapshot.map(({ id }) => deleteFile({ fileId: id, path })),
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      const ok = results.length - failed;

      if (ok > 0) {
        toast.success(
          `Moved ${ok} item${ok === 1 ? "" : "s"} to Trash${
            failed > 0 ? ` (${failed} failed)` : ""
          }.`,
          {
            duration: 7000,
            action: {
              label: "Undo",
              onClick: async () => {
                const undo = await Promise.allSettled(
                  snapshot.map(({ id }) => restoreFile({ fileId: id, path })),
                );
                const undoFailed = undo.filter(
                  (r) => r.status === "rejected",
                ).length;
                if (undoFailed === 0) {
                  toast.success(
                    `Restored ${snapshot.length} item${
                      snapshot.length === 1 ? "" : "s"
                    }.`,
                  );
                } else {
                  toast.error(`Couldn't restore ${undoFailed} item(s).`);
                }
              },
            },
          },
        );
      } else if (failed > 0) {
        toast.error("Couldn't move items to Trash.");
      }
      multi.clear();
    });
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          key="bulk-actions-bar"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          // Disable motion under prefers-reduced-motion. framer-motion
          // doesn't read the OS pref automatically; the CSS class falls back
          // to no-transform.
          className={cn(
            "fixed bottom-4 inset-x-4 z-40 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2",
            "motion-reduce:transform-none motion-reduce:transition-none",
          )}
          role="region"
          aria-label="Bulk actions"
        >
          <div
            className={cn(
              "mx-auto flex w-full max-w-screen-sm items-center gap-2 rounded-2xl border border-border/70 bg-background/85 px-3 py-2 shadow-elevated backdrop-blur-md sm:gap-3 sm:px-4 sm:py-2.5",
            )}
          >
            <p className="shrink-0 text-sm font-medium tabular-nums">
              <span className="text-primary">{count}</span>{" "}
              <span className="hidden text-muted-foreground sm:inline">
                selected
              </span>
            </p>

            <div className="mx-1 h-6 w-px shrink-0 bg-border/70" aria-hidden />

            <div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:justify-start sm:gap-2">
              <BulkButton
                onClick={handleDownload}
                icon={<Download aria-hidden="true" className="size-4" />}
                label="Download"
              />
              <BulkButton
                onClick={() => setMoveOpen(true)}
                icon={<FolderInput aria-hidden="true" className="size-4" />}
                label="Move"
                disabled={isPending}
              />
              <BulkButton
                onClick={handleTrash}
                icon={
                  isPending ? (
                    <Loader2
                      aria-hidden="true"
                      className="size-4 animate-spin motion-reduce:animate-none"
                    />
                  ) : (
                    <Trash2 aria-hidden="true" className="size-4" />
                  )
                }
                label="Move to trash"
                destructive
                disabled={isPending}
              />
            </div>

            <button
              type="button"
              onClick={() => multi.clear()}
              aria-label="Clear selection"
              className="ring-focus inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <BulkMoveDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        selectedFiles={selectedFiles}
        path={path}
        onDone={() => multi.clear()}
      />
    </>
  );
}

interface BulkButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  destructive?: boolean;
  disabled?: boolean;
}

/**
 * Bulk-bar button. Renders icon-only on mobile (saves horizontal space on
 * 375px-wide viewports) and icon + label from `sm:` upward.
 */
function BulkButton({
  onClick,
  icon,
  label,
  destructive,
  disabled,
}: BulkButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant={destructive ? "ghost" : "ghost"}
      size="sm"
      aria-label={label}
      className={cn(
        "h-9 shrink-0 gap-1.5 px-2.5 sm:px-3",
        destructive &&
          "text-destructive hover:bg-destructive/10 hover:text-destructive",
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

// --- Bulk move dialog --------------------------------------------------------

interface BulkMoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFiles: Models.DefaultDocument[];
  path: string;
  onDone: () => void;
}

/**
 * Lightweight bulk move dialog. Mirrors the styling of `MoveToFolderDialog`
 * but moves N files in one transition. We don't reuse the single-file dialog
 * directly because it's tightly coupled to one `file` prop — wrapping it
 * would mean per-file dialogs, which is a worse UX than a single picker.
 */
function BulkMoveDialog({
  open,
  onOpenChange,
  selectedFiles,
  path,
  onDone,
}: BulkMoveDialogProps) {
  const [folders, setFolders] = useState<Models.DefaultDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setIsLoading(true);
    getFolders({ parentId: null })
      .then((res) => {
        const docs = ((res as { documents?: Models.DefaultDocument[] })
          ?.documents ?? []) as Models.DefaultDocument[];
        setFolders(docs);
      })
      .catch(() => toast.error("Couldn't load folders."))
      .finally(() => setIsLoading(false));
  }, [open]);

  const handleMove = () => {
    startTransition(async () => {
      const results = await Promise.allSettled(
        selectedFiles.map((f) =>
          moveFile({ fileId: f.$id, folderId: selected, path }),
        ),
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      const ok = results.length - failed;
      const destLabel =
        selected === null
          ? "Root"
          : folders.find((f) => f.$id === selected)?.name ?? "folder";
      if (ok > 0) {
        toast.success(
          `Moved ${ok} item${ok === 1 ? "" : "s"} to ${destLabel}${
            failed > 0 ? ` (${failed} failed)` : ""
          }.`,
        );
      } else {
        toast.error("Couldn't move items.");
      }
      onOpenChange(false);
      onDone();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Move {selectedFiles.length} item
            {selectedFiles.length === 1 ? "" : "s"} to…
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 pt-2">
          <div className="max-h-72 space-y-1 overflow-y-auto rounded-xl border border-border/60 bg-card p-1">
            <FolderRow
              icon={Home}
              label="Root (no folder)"
              selected={selected === null}
              onClick={() => setSelected(null)}
            />
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                <Loader2
                  aria-hidden="true"
                  className="size-4 animate-spin motion-reduce:animate-none"
                />
                Loading folders…
              </div>
            ) : folders.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                No folders yet. Create one from the dashboard first.
              </p>
            ) : (
              folders.map((f) => (
                <FolderRow
                  key={f.$id}
                  icon={FolderIcon}
                  label={f.name}
                  selected={selected === f.$id}
                  onClick={() => setSelected(f.$id)}
                />
              ))
            )}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={isPending || isLoading}
            className="flex-1"
          >
            {isPending && (
              <Loader2
                aria-hidden="true"
                className="mr-2 size-4 animate-spin motion-reduce:animate-none"
              />
            )}
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FolderRowProps {
  icon: React.ElementType;
  label: string;
  selected: boolean;
  onClick: () => void;
}

const FolderRow = ({ icon: Icon, label, selected, onClick }: FolderRowProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
      selected
        ? "bg-primary/10 text-primary"
        : "hover:bg-accent hover:text-accent-foreground",
    )}
  >
    <Icon aria-hidden="true" className="size-4 shrink-0" />
    <span className="min-w-0 flex-1 truncate">{label}</span>
    {selected && (
      <span className="shrink-0 text-xs font-medium">Selected</span>
    )}
  </button>
);

export default BulkActionsBar;
