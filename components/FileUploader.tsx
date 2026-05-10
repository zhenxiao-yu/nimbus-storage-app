"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { usePathname } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import Thumbnail from "@/components/Thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
import { cn, convertFileSize, convertFileToUrl, getFileType } from "@/lib/utils";
import { uploadFile } from "@/lib/actions/file.actions";

interface Props {
  ownerId: string;
  accountId: string;
  className?: string;
}

const FileUploader = ({ ownerId, accountId, className }: Props) => {
  const path = usePathname();
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      setFiles(accepted);

      await Promise.all(
        accepted.map(async (file) => {
          if (file.size > MAX_FILE_SIZE) {
            setFiles((prev) => prev.filter((f) => f.name !== file.name));
            toast.error(`${file.name} is too large`, {
              description: `Max upload is ${convertFileSize(MAX_FILE_SIZE, 0)}`,
            });
            return;
          }
          try {
            const uploaded = await uploadFile({
              file,
              ownerId,
              accountId,
              path,
            });
            if (uploaded) {
              setFiles((prev) => prev.filter((f) => f.name !== file.name));
              toast.success(`${file.name} uploaded`);
            }
          } catch {
            setFiles((prev) => prev.filter((f) => f.name !== file.name));
            toast.error(`Couldn't upload ${file.name}`);
          }
        }),
      );
    },
    [ownerId, accountId, path],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleRemoveFile = (
    e: React.MouseEvent,
    fileName: string,
  ) => {
    e.stopPropagation();
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  return (
    <div {...getRootProps()} className={cn("inline-block", className)}>
      <input {...getInputProps()} />
      <Button
        type="button"
        className={cn(
          "h-10 gap-2 px-4 font-medium",
          "bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 text-white shadow-glow hover:opacity-95",
          isDragActive && "ring-2 ring-primary ring-offset-2",
          className,
        )}
      >
        <Upload className="size-4" />
        Upload
      </Button>

      {files.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 w-[min(420px,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevated">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <p className="text-sm font-semibold">
              Uploading {files.length} {files.length === 1 ? "file" : "files"}
            </p>
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
          <ul className="max-h-80 divide-y divide-border/60 overflow-y-auto scrollbar-thin">
            {files.map((file, index) => {
              const { type, extension } = getFileType(file.name);
              return (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Thumbnail
                      type={type}
                      extension={extension}
                      url={convertFileToUrl(file)}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {convertFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveFile(e, file.name)}
                    className="ring-focus rounded-full p-1 text-muted-foreground hover:text-foreground"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
