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
  ShareLinkPanel,
} from "@/components/ActionsModalContent";
import MoveToFolderDialog from "@/components/MoveToFolderDialog";
import { actionsDropdownItems } from "@/constants";
import { constructDownloadUrl } from "@/lib/utils";
import {
  deleteFile,
  renameFile,
  restoreFile,
  updateFileUsers,
} from "@/lib/actions/file.actions";

const ActionDropdown = ({ file }: { file: Models.DefaultDocument }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
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
        toast.success(`${action.label} succeeded.`);
      } else if (action.value === "share") {
        await updateFileUsers({ fileId: file.$id, emails, path });
        toast.success(`${action.label} succeeded.`);
      } else if (action.value === "delete") {
        await deleteFile({ fileId: file.$id, path });
        toast.success(`Moved "${file.name}" to Trash.`, {
          duration: 7000,
          action: {
            label: "Undo",
            onClick: async () => {
              try {
                await restoreFile({ fileId: file.$id, path });
                toast.success(`Restored "${file.name}".`);
              } catch {
                toast.error("Couldn't undo the delete.");
              }
            },
          },
        });
      }
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
      <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl sm:max-w-md">
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
          {value === "share-link" && (
            <ShareLinkPanel file={file} path={path} />
          )}
          {value === "delete" && (
            <p className="text-center text-sm text-muted-foreground">
              You&apos;re about to move{" "}
              <span className="break-all font-medium text-foreground">
                {file.name}
              </span>{" "}
              to Trash. You can restore it from there.
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
              {isLoading && (
                <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin motion-reduce:animate-none" />
              )}
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
            <MoreVertical aria-hidden="true" className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="truncate">
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
                    <Icon aria-hidden="true" className="size-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              );
            }
            if (item.value === "beam") {
              return (
                <DropdownMenuItem key={item.value} asChild>
                  <Link
                    href={`/dashboard/beam/${file.$id}`}
                    className="flex items-center gap-2"
                  >
                    <Icon aria-hidden="true" className="size-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              );
            }
            if (item.value === "move") {
              return (
                <DropdownMenuItem
                  key={item.value}
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsMoveOpen(true);
                  }}
                  className="gap-2"
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {item.label}
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
                <Icon aria-hidden="true" className="size-4" />
                {item.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {renderDialogContent()}

      <MoveToFolderDialog
        file={file}
        path={path}
        open={isMoveOpen}
        onOpenChange={setIsMoveOpen}
      />
    </Dialog>
  );
};

export default ActionDropdown;
