import Image from "next/image";

import { cn, constructPreviewUrl, getFileIcon } from "@/lib/utils";

/**
 * Maps the abstract `size` prop to a concrete Appwrite preview width.
 * 96  — list rows / dense UIs
 * 320 — grid cards
 * 1024 — preview modal hero
 */
const SIZE_PX: Record<NonNullable<Props["size"]>, number> = {
  sm: 96,
  md: 320,
  lg: 1024,
};

interface Props {
  type: string;
  extension: string;
  /**
   * Fallback URL used when `bucketFileId` is not provided. Kept for
   * backwards compatibility with callers that don't yet thread the bucket
   * ID through.
   */
  url?: string;
  /**
   * Appwrite Storage blob ID. When present and the file is an image, we
   * render a resized preview via the Appwrite preview endpoint instead of
   * the full original.
   */
  bucketFileId?: string;
  /** Selects the preview pixel size. Default behaves like the old component. */
  size?: "sm" | "md" | "lg";
  imageClassName?: string;
  className?: string;
}

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

  // Prefer the Appwrite preview endpoint when we have a bucket ID — it's
  // resized, webp-encoded, and a fraction of the bandwidth of the original.
  // Fall back to the raw URL if no bucket ID is wired through (older call
  // sites) so we never render a broken image.
  const previewWidth = size ? SIZE_PX[size] : 320;
  const imageSrc = isImage
    ? bucketFileId
      ? constructPreviewUrl(bucketFileId, {
          width: previewWidth,
          height: previewWidth,
        })
      : url
    : getFileIcon(extension, type);

  return (
    <figure
      className={cn(
        "flex size-12 min-w-12 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-accent/40",
        className,
      )}
    >
      <Image
        src={imageSrc}
        alt={`${type} thumbnail`}
        width={previewWidth}
        height={previewWidth}
        // Appwrite already returns webp at the requested size; let Next skip
        // its optimizer to avoid an extra hop.
        unoptimized={isImage}
        loading="lazy"
        decoding="async"
        className={cn(
          "size-7 object-contain",
          imageClassName,
          isImage && "size-full object-cover object-center",
        )}
      />
    </figure>
  );
};

export default Thumbnail;
