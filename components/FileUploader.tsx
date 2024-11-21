"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import Thumbnail from "@/components/Thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";

interface Props {
  ownerId: string; // Unique ID of the file owner
  accountId: string; // Unique ID of the associated account
  className?: string; // Optional additional CSS class for styling
}

/**
 * FileUploader component allows users to upload and preview files.
 */
const FileUploader = ({ ownerId, accountId, className }: Props) => {
  // Get the current pathname for file upload context
  const path = usePathname();

  // Access toast notification functionality
  const { toast } = useToast();

  // State to manage the list of selected files
  const [files, setFiles] = useState<File[]>([]);

  /**
   * Handles the file drop event by validating and uploading files.
   * @param acceptedFiles - List of files dropped into the dropzone
   */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Update state with newly dropped files
      setFiles(acceptedFiles);

      // Map over files and handle validation and upload
      const uploadPromises = acceptedFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          // Remove file from the list if it exceeds the max size
          setFiles((prevFiles) =>
            prevFiles.filter((f) => f.name !== file.name),
          );

          // Show error toast
          return toast({
            description: (
              <p className="body-2 text-white">
                <span className="font-semibold">{file.name}</span> is too large.
                Max file size is 50MB.
              </p>
            ),
            className: "error-toast",
          });
        }

        // Attempt to upload the file
        return uploadFile({ file, ownerId, accountId, path }).then(
          (uploadedFile) => {
            if (uploadedFile) {
              // Remove successfully uploaded file from the list
              setFiles((prevFiles) =>
                prevFiles.filter((f) => f.name !== file.name),
              );
            }
          },
        );
      });

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
    },
    [ownerId, accountId, path, toast],
  );

  // Configure Dropzone for drag-and-drop functionality
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  /**
   * Removes a specific file from the list when the remove icon is clicked.
   * @param e - Mouse event from clicking the remove icon
   * @param fileName - Name of the file to remove
   */
  const handleRemoveFile = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    fileName: string,
  ) => {
    e.stopPropagation(); // Prevent event from bubbling
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div {...getRootProps()} className="cursor-pointer">
      {/* Hidden input element for file selection */}
      <input {...getInputProps()} />

      {/* Upload button */}
      <Button type="button" className={cn("uploader-button", className)}>
        <Image
          src="/assets/icons/upload.svg"
          alt="upload"
          width={24}
          height={24}
        />
        <p>Upload</p>
      </Button>

      {/* File preview section */}
      {files.length > 0 && (
        <ul className="uploader-preview-list">
          <h4 className="h4 text-light-100">Uploading</h4>

          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);

            return (
              <li
                key={`${file.name}-${index}`}
                className="uploader-preview-item"
              >
                <div className="flex items-center gap-3">
                  {/* Thumbnail preview for the file */}
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />

                  {/* File name and loading indicator */}
                  <div className="preview-item-name">
                    {file.name}
                    <Image
                      src="/assets/icons/file-loader.gif"
                      width={80}
                      height={26}
                      alt="Loader"
                    />
                  </div>
                </div>

                {/* Remove icon to delete file from the list */}
                <Image
                  src="/assets/icons/remove.svg"
                  width={24}
                  height={24}
                  alt="Remove"
                  onClick={(e) => handleRemoveFile(e, file.name)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
