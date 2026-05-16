"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Models } from "node-appwrite";
import { motion } from "framer-motion";
import {
  Folder as FolderIcon,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

import FormattedDateTime from "@/components/FormattedDateTime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteFolder, renameFolder } from "@/lib/actions/folder.actions";

type DialogMode = "rename" | "delete" | null;

const FolderCard = ({ folder }: { folder: Models.DefaultDocument }) => {
  const [mode, setMode] = useState<DialogMode>(null);
  const [name, setName] = useState<string>(folder.name);
  const [isPending, startTransition] = useTransition();
  const path = usePathname();

  const close = () => {
    setMode(null);
    setName(folder.name);
  };

  const handleRename = () => {
    startTransition(async () => {
      try {
        await renameFolder({ folderId: folder.$id, name, path });
        toast.success("Folder renamed.");
        close();
      } catch {
        toast.error("Couldn't rename folder.");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteFolder({ folderId: folder.$id, path });
        toast.success(`Deleted "${folder.name}".`);
        close();
      } catch {
        toast.error("Couldn't delete folder.");
      }
    });
  };

  return (
    <>
      <motion.article
        layout
        variants={{
          hidden: { opacity: 0, y: 14 },
          show: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 320, damping: 28 },
          },
        }}
        exit={{
          opacity: 0,
          scale: 0.9,
          y: -10,
          transition: { duration: 0.2 },
        }}
        whileHover={{
          y: -4,
          transition: { type: "spring", stiffness: 320, damping: 22 },
        }}
        className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-[border-color,box-shadow] duration-200 hover:border-border hover:shadow-elevated"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:from-primary/[0.04] group-hover:via-transparent group-hover:to-fuchsia-500/[0.06] group-hover:opacity-100"
        />

        <div className="flex items-start justify-between gap-2">
          <div className="flex size-16 min-w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-border/40 transition-shadow group-hover:ring-primary/30">
            <FolderIcon aria-hidden="true" className="size-8" />
          </div>

          <div
            className="shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label="Folder actions"
                >
                  <MoreVertical aria-hidden="true" className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="truncate">
                  {folder.name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2"
                  onClick={() => setMode("rename")}
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 text-destructive focus:text-destructive"
                  onClick={() => setMode("delete")}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Link
          href={`/dashboard/folders/${folder.$id}`}
          className="ring-focus flex min-w-0 flex-col gap-1 rounded-md text-left focus:outline-none"
        >
          <p className="line-clamp-2 break-all text-sm font-medium leading-snug transition-colors group-hover:text-primary">
            {folder.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">Folder</p>
        </Link>

        <FormattedDateTime
          date={folder.$createdAt}
          className="caption mt-auto pt-2"
        />
      </motion.article>

      <Dialog open={mode !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {mode === "rename" ? "Rename folder" : "Delete folder"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            {mode === "rename" && (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            )}
            {mode === "delete" && (
              <p className="text-center text-sm text-muted-foreground">
                You&apos;re about to delete{" "}
                <span className="break-all font-medium text-foreground">
                  {folder.name}
                </span>
                . Files inside stay in your library — only the folder is
                removed.
              </p>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={close} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={mode === "rename" ? handleRename : handleDelete}
              variant={mode === "delete" ? "destructive" : "default"}
              className="flex-1"
              disabled={isPending}
            >
              {mode === "rename" ? "Rename" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FolderCard;
