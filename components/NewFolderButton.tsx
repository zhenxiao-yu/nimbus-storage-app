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

const MAX_FOLDER_NAME = 60;

const NewFolderButton = ({
  parentId = null,
  variant = "default",
  size = "sm",
  label = "New folder",
  className,
}: NewFolderButtonProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const path = usePathname();

  const close = () => {
    setOpen(false);
    setName("");
    setError(null);
  };

  const validate = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return "Give the folder a name first.";
    if (trimmed.length > MAX_FOLDER_NAME)
      return `Keep it under ${MAX_FOLDER_NAME} characters.`;
    if (/[\\/]/.test(trimmed))
      return "Folder names can't contain slashes.";
    return null;
  };

  const handleCreate = () => {
    const trimmed = name.trim();
    const validationError = validate(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createFolder({ name: trimmed, parentId, path });
        toast.success(`Created "${trimmed}".`);
        close();
      } catch {
        toast.error("Couldn't create folder.");
        setError("Couldn't create folder. Try again.");
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

        <div className="space-y-1.5 pt-2">
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Folder name"
            autoFocus
            maxLength={MAX_FOLDER_NAME + 20}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "new-folder-error" : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <div className="flex items-start justify-between gap-3 text-xs">
            {error ? (
              <p
                id="new-folder-error"
                role="alert"
                className="text-destructive"
              >
                {error}
              </p>
            ) : (
              <span className="text-muted-foreground">
                Letters, numbers, spaces — no slashes.
              </span>
            )}
            <span
              className={
                name.trim().length > MAX_FOLDER_NAME
                  ? "shrink-0 tabular-nums text-destructive"
                  : "shrink-0 tabular-nums text-muted-foreground"
              }
            >
              {name.trim().length}/{MAX_FOLDER_NAME}
            </span>
          </div>
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
