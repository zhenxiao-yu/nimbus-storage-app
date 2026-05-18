"use client";

import { useEffect, useState, useTransition } from "react";
import { Models } from "node-appwrite";
import { Folder as FolderIcon, Home, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { moveFile } from "@/lib/actions/file.actions";
import { getFolders } from "@/lib/actions/folder.actions";

interface MoveToFolderDialogProps {
  file: Models.DefaultDocument;
  path: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Lists the current user's top-level folders (plus a "Root" option) and
 * moves the selected file into the chosen destination. Loads folders lazily
 * the first time the dialog opens so we don't fetch on every card mount.
 */
const MoveToFolderDialog = ({
  file,
  path,
  open,
  onOpenChange,
}: MoveToFolderDialogProps) => {
  const currentFolderId: string | null = file.folderId ?? null;
  const [folders, setFolders] = useState<Models.DefaultDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(currentFolderId);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    // Open-driven reset + fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(currentFolderId);
    setIsLoading(true);
    getFolders({ parentId: null })
      .then((res) => {
        const docs = ((res as { documents?: Models.DefaultDocument[] })
          ?.documents ?? []) as Models.DefaultDocument[];
        setFolders(docs);
      })
      .catch(() => {
        toast.error("Couldn't load folders.");
      })
      .finally(() => setIsLoading(false));
  }, [open, currentFolderId]);

  const handleMove = () => {
    if (selected === currentFolderId) {
      onOpenChange(false);
      return;
    }
    startTransition(async () => {
      try {
        await moveFile({ fileId: file.$id, folderId: selected, path });
        const destLabel =
          selected === null
            ? "Root"
            : folders.find((f) => f.$id === selected)?.name ?? "folder";
        toast.success(`Moved "${file.name}" to ${destLabel}.`);
        onOpenChange(false);
      } catch {
        toast.error("Couldn't move file.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Move to folder</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 pt-2">
          <p className="text-xs text-muted-foreground">
            Moving{" "}
            <span className="break-all font-medium text-foreground">
              {file.name}
            </span>
          </p>

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
};

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

export default MoveToFolderDialog;
