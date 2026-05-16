"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Models } from "node-appwrite";
import { motion } from "framer-motion";
import {
  Loader2,
  MoreVertical,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import Thumbnail from "@/components/Thumbnail";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  permanentlyDeleteFile,
  restoreFile,
} from "@/lib/actions/file.actions";
import { cn, convertFileSize, formatRelativeTime } from "@/lib/utils";

const TrashCard = ({ file }: { file: Models.DefaultDocument }) => {
  const path = usePathname();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleRestore = () => {
    startTransition(async () => {
      try {
        await restoreFile({ fileId: file.$id, path });
        toast.success(`Restored "${file.name}".`);
      } catch {
        toast.error("Couldn't restore. Try again.");
      }
    });
  };

  const handlePermanentDelete = () => {
    setConfirmOpen(false);
    startTransition(async () => {
      try {
        await permanentlyDeleteFile({
          fileId: file.$id,
          bucketFileId: file.bucketFileId,
          path,
        });
        toast.success(`Deleted "${file.name}" forever.`);
      } catch {
        toast.error("Couldn't delete. Try again.");
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
        exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } }}
        className={cn(
          "group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-[border-color,box-shadow] duration-200 hover:border-border hover:shadow-elevated",
          isPending && "pointer-events-none opacity-60",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <Thumbnail
            type={file.type}
            extension={file.extension}
            url={file.url}
            className="size-16 min-w-16 shrink-0 ring-1 ring-border/40 grayscale transition-[filter] group-hover:grayscale-0"
          />
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label="Trash item actions"
              >
                {isPending ? (
                  <Loader2
                    aria-hidden="true"
                    className="size-4 animate-spin motion-reduce:animate-none"
                  />
                ) : (
                  <MoreVertical aria-hidden="true" className="size-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="truncate">
                {file.name}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2" onClick={handleRestore}>
                <RotateCcw aria-hidden="true" className="size-4" />
                Restore
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Delete forever
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <p className="line-clamp-2 break-all text-sm font-medium leading-snug">
            {file.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">
              {convertFileSize(file.size)}
            </span>
            <span className="mx-1.5 text-border">·</span>
            <span>Trashed {formatRelativeTime(file.deletedAt)}</span>
          </p>
        </div>
      </motion.article>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete forever?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="break-all font-medium text-foreground">
                {file.name}
              </span>{" "}
              will be permanently removed from your storage. This can&apos;t be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TrashCard;
