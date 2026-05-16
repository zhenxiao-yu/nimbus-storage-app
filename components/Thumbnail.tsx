"use client";

import Image from "next/image";
import { useState } from "react";

import { cn, constructPreviewUrl, getFileIcon } from "@/lib/utils";

const SIZE_PX: Record<NonNullable<Props["size"]>, number> = {
  sm: 96,
  md: 320,
  lg: 1024,
};

interface Props {
  type: string;
  extension: string;
  /** Fallback URL when bucketFileId is absent. */
  url?: string;
  /** Appwrite Storage blob ID. */
  bucketFileId?: string;
  size?: "sm" | "md" | "lg";
  imageClassName?: string;
  className?: string;
}

/**
 * Renders a file thumbnail. For image-type files we try the Appwrite
 * preview endpoint (resized webp), but if it fails for any reason — perms,
 * CORS, network — we transparently fall back to the static file-type icon
 * so the user never sees a broken-image glyph.
 */
export const Thumbnail = ({
  type,
  extension,
  url = "",
  bucketFileId,
  size,
  imageClassName,
  className,
}: Props) => {
  const isImage = type === "image" && extension !== "svg";
  const previewWidth = size ? SIZE_PX[size] : 320;
  const fallbackIcon = getFileIcon(extension, type);

  const previewSrc = isImage
    ? bucketFileId
      ? constructPreviewUrl(bucketFileId, {
          width: previewWidth,
          height: previewWidth,
        })
      : url || fallbackIcon
    : fallbackIcon;

  const [errored, setErrored] = useState(false);
  const showImage = isImage && !errored;
  const finalSrc = showImage ? previewSrc : fallbackIcon;

  return (
    <figure
      className={cn(
        "flex size-12 min-w-12 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-accent/40",
        className,
      )}
    >
      <Image
        src={finalSrc}
        alt={`${type} thumbnail`}
        width={showImage ? previewWidth : 48}
        height={showImage ? previewWidth : 48}
        unoptimized={showImage}
        loading="lazy"
        decoding="async"
        onError={() => setErrored(true)}
        className={cn(
          "size-7 object-contain",
          imageClassName,
          showImage && "size-full object-cover object-center",
        )}
      />
    </figure>
  );
};

export default Thumbnail;
