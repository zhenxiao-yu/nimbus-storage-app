"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Models } from "node-appwrite";
import { Loader2, MoreVertical } from "lucide-react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FileDetails,
  ShareInput,
} from "@/components/ActionsModalContent";
import { actionsDropdownItems } from "@/constants";
import { constructDownloadUrl } from "@/lib/utils";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
} from "@/lib/actions/file.actions";

const ActionDropdown = ({ file }: { file: Models.Document }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [name, setName] = useState(file.name.replace(/\.[^.]+$/, ""));
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);

  const path = usePathname();

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);

    try {
      if (action.value === "rename") {
        await renameFile({
          fileId: file.$id,
          name,
          extension: file.extension,
          path,
        });
      } else if (action.value === "share") {
        await updateFileUsers({ fileId: file.$id, emails, path });
      } else if (action.value === "delete") {
        await deleteFile({
          fileId: file.$id,
          bucketFileId: file.bucketFileId,
          path,
        });
      }
      toast.success(`${action.label} succeeded.`);
      closeAllModals();
    } catch {
      toast.error(`Couldn't ${action.label.toLowerCase()}. Try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (email: string) => {
    const updated = emails.filter((e) => e !== email);
    try {
      await updateFileUsers({ fileId: file.$id, emails: updated, path });
      setEmails(updated);
      toast.success(`Removed ${email}.`);
    } catch {
      toast.error("Couldn't update sharing.");
    }
  };

  const renderDialogContent = () => {
    if (!action) return null;
    const { value, label } = action;

    return (
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">{label}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {value === "rename" && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          )}
          {value === "details" && <FileDetails file={file} />}
          {value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setEmails}
              onRemove={handleRemoveUser}
            />
          )}
          {value === "delete" && (
            <p className="text-center text-sm text-muted-foreground">
              You&apos;re about to permanently delete{" "}
              <span className="font-medium text-foreground">{file.name}</span>.
              This can&apos;t be undone.
            </p>
          )}
        </div>

        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={closeAllModals}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              variant={value === "delete" ? "destructive" : "default"}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              <span className="capitalize">{value}</span>
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="File actions"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((item) => {
            const Icon = item.icon;
            if (item.value === "download") {
              return (
                <DropdownMenuItem key={item.value} asChild>
                  <Link
                    href={constructDownloadUrl(file.bucketFileId)}
                    download={file.name}
                    target="_blank"
                    className="flex items-center gap-2"
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              );
            }
            return (
              <DropdownMenuItem
                key={item.value}
                onClick={() => {
                  setAction({ label: item.label, value: item.value });
                  setIsModalOpen(true);
                }}
                className="gap-2"
              >
                <Icon className="size-4" />
                {item.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionDropdown;
