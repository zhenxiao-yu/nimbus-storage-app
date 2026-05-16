"use client";

import { useState } from "react";
import { Models } from "node-appwrite";
import { motion } from "framer-motion";

import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import ActionDropdown from "@/components/ActionDropdown";
import PreviewModal from "@/components/PreviewModal";
import { convertFileSize } from "@/lib/utils";

const Card = ({ file }: { file: Models.DefaultDocument }) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <motion.article
      layout
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: {
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 320, damping: 28 },
        },
      }}
      exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } }}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 320, damping: 22 } }}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-[border-color,box-shadow] duration-200 hover:border-border hover:shadow-elevated"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:from-primary/[0.04] group-hover:via-transparent group-hover:to-fuchsia-500/[0.06] group-hover:opacity-100"
      />

      <div className="flex items-start justify-between gap-2">
        <Thumbnail
          type={file.type}
          extension={file.extension}
          url={file.url}
          className="size-16 min-w-16 shrink-0 ring-1 ring-border/40 transition-shadow group-hover:ring-primary/30"
        />
        <div
          className="shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ActionDropdown file={file} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="ring-focus flex min-w-0 flex-col gap-1 rounded-md text-left focus:outline-none"
      >
        <p className="line-clamp-2 break-all text-sm font-medium leading-snug transition-colors group-hover:text-primary">
          {file.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          <span className="font-medium text-foreground/70">
            {convertFileSize(file.size)}
          </span>
          <span className="mx-1.5 text-border">·</span>
          <span>By {file.owner?.fullName ?? "you"}</span>
        </p>
      </button>

      <FormattedDateTime
        date={file.$createdAt}
        className="caption mt-auto pt-2"
      />

      <PreviewModal
        file={file}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </motion.article>
  );
};

export default Card;
