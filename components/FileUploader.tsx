"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CloudUpload, Loader2, Upload, X } from "lucide-react";
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
  });

  const handleRemoveFile = (e: React.MouseEvent, fileName: string) => {
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

      <AnimatePresence>
        {isDragActive && (
            <motion.div
              key="drag-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-background/70 backdrop-blur-md"
              aria-hidden
            >
              <div className="pointer-events-none absolute inset-4 rounded-3xl border-2 border-dashed border-primary/60 ring-4 ring-primary/15" />
              <motion.div
                initial={{ scale: 0.9, y: 8 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 4 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className="flex flex-col items-center gap-4 px-6 text-center"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 text-white shadow-glow-lg"
                >
                  <CloudUpload className="size-10" />
                </motion.div>
                <div className="space-y-1">
                  <p className="text-2xl font-semibold tracking-tight">
                    Drop to upload
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Release anywhere on the page to add your files
                  </p>
                </div>
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            key="upload-tray"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 w-[min(420px,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevated"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <p className="text-sm font-semibold">
                Uploading {files.length} {files.length === 1 ? "file" : "files"}
              </p>
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
            <ul className="max-h-80 divide-y divide-border/60 overflow-y-auto scrollbar-thin">
              <AnimatePresence initial={false}>
                {files.map((file, index) => {
                  const { type, extension } = getFileType(file.name);
                  return (
                    <motion.li
                      key={`${file.name}-${index}`}
                      layout
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="shrink-0">
                          <Thumbnail
                            type={type}
                            extension={extension}
                            url={convertFileToUrl(file)}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
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
                        className="ring-focus shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="size-4" />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploader;
