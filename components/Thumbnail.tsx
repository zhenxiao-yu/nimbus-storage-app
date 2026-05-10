import Image from "next/image";

import { cn, getFileIcon } from "@/lib/utils";

interface Props {
  type: string;
  extension: string;
  url?: string;
  imageClassName?: string;
  className?: string;
}

export const Thumbnail = ({
  type,
  extension,
  url = "",
  imageClassName,
  className,
}: Props) => {
  const isImage = type === "image" && extension !== "svg";

  return (
    <figure
      className={cn(
        "flex size-12 min-w-12 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-accent/40",
        className,
      )}
    >
      <Image
        src={isImage ? url : getFileIcon(extension, type)}
        alt={`${type} thumbnail`}
        width={100}
        height={100}
        unoptimized={isImage}
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
