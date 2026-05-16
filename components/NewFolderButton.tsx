"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { FolderPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createFolder } from "@/lib/actions/folder.actions";

interface NewFolderButtonProps {
  parentId?: string | null;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
  className?: string;
}

const NewFolderButton = ({
  parentId = null,
  variant = "default",
  size = "sm",
  label = "New folder",
  className,
}: NewFolderButtonProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const path = usePathname();

  const close = () => {
    setOpen(false);
    setName("");
  };

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Give the folder a name first.");
      return;
    }
    startTransition(async () => {
      try {
        await createFolder({ name: trimmed, parentId, path });
        toast.success(`Created "${trimmed}".`);
        close();
      } catch {
        toast.error("Couldn't create folder.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <FolderPlus aria-hidden="true" className="mr-2 size-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">New folder</DialogTitle>
        </DialogHeader>

        <div className="pt-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={close} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isPending}
            className="flex-1"
          >
            {isPending && (
              <Loader2
                aria-hidden="true"
                className="mr-2 size-4 animate-spin motion-reduce:animate-none"
              />
            )}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewFolderButton;
