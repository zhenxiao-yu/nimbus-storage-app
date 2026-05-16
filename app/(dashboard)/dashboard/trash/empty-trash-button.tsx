"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { permanentlyDeleteFile } from "@/lib/actions/file.actions";

interface TrashEntry {
  fileId: string;
  bucketFileId: string;
  name: string;
}

interface Props {
  files: TrashEntry[];
}

const EmptyTrashButton = ({ files }: Props) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleEmpty = () => {
    setOpen(false);
    startTransition(async () => {
      let failures = 0;
      for (const f of files) {
        try {
          await permanentlyDeleteFile({
            fileId: f.fileId,
            bucketFileId: f.bucketFileId,
            path: "/dashboard/trash",
          });
        } catch {
          failures += 1;
        }
      }
      if (failures === 0) {
        toast.success(`Emptied trash (${files.length} files).`);
      } else {
        toast.error(
          `Removed ${files.length - failures} files, ${failures} failed.`,
        );
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2
              aria-hidden="true"
              className="size-4 animate-spin motion-reduce:animate-none"
            />
          ) : (
            <Trash2 aria-hidden="true" className="size-4" />
          )}
          Empty trash
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Empty trash?</AlertDialogTitle>
          <AlertDialogDescription>
            All {files.length} {files.length === 1 ? "file" : "files"} will be
            permanently removed from your storage. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleEmpty}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Empty trash
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EmptyTrashButton;
