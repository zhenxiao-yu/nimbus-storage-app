"use client";

import { useState } from "react";
import { Models } from "node-appwrite";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Circle } from "lucide-react";

import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import ActionDropdown from "@/components/ActionDropdown";
import PreviewModal from "@/components/PreviewModal";
import { useMultiSelect } from "@/components/MultiSelectProvider";
import { cn, convertFileSize } from "@/lib/utils";

interface CardProps {
  file: Models.DefaultDocument;
  /**
   * In-render order of the surrounding list, used by shift-click range
   * selection. Provided by FileGrid; omitted by callers that don't need
   * multi-select.
   */
  orderedIds?: string[];
}

const Card = ({ file, orderedIds }: CardProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const multi = useMultiSelect();
  const selected = multi?.isSelected(file.$id) ?? false;
  // When at least one card is selected, plain clicks toggle selection
  // (Finder-style "selection mode"). When nothing is selected, clicking a
  // card opens its preview as before.
  const anySelected = (multi?.selectedCount ?? 0) > 0;

  const handleCardClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
  ) => {
    const meta = e.metaKey || e.ctrlKey;
    const shift = e.shiftKey;
    if (multi && (anySelected || meta || shift)) {
      e.preventDefault();
      multi.handleItemClick({
        id: file.$id,
        orderedIds: orderedIds ?? [file.$id],
        shift,
        meta,
      });
      return;
    }
    setPreviewOpen(true);
  };

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
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-[border-color,box-shadow] duration-200 hover:border-border hover:shadow-elevated",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:from-primary/[0.04] group-hover:via-transparent group-hover:to-fuchsia-500/[0.06] group-hover:opacity-100"
      />

      {/* Hover-only "empty" checkbox top-left when any card is selected. Lets
          the user discover the selection affordance without it being noisy by
          default. Hidden once this card is itself selected — its filled badge
          on the top-right takes over. */}
      {multi && anySelected && !selected && (
        <button
          type="button"
          aria-label={`Select ${file.name}`}
          onClick={(e) => {
            e.stopPropagation();
            multi.handleItemClick({
              id: file.$id,
              orderedIds: orderedIds ?? [file.$id],
              shift: e.shiftKey,
              meta: e.metaKey || e.ctrlKey,
            });
          }}
          className="ring-focus absolute left-3 top-3 z-10 inline-flex size-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 ring-1 ring-border/60 backdrop-blur transition-opacity duration-150 hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Circle aria-hidden="true" className="size-3.5" />
        </button>
      )}

      {/* Filled checkmark badge — visible only while this card is selected. */}
      <AnimatePresence>
        {multi && selected && (
          <motion.span
            key="selected-badge"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 480, damping: 26 }}
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-3 z-10 inline-flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft motion-reduce:transition-none"
          >
            <Check className="size-3.5" />
          </motion.span>
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between gap-2">
        <Thumbnail
          type={file.type}
          extension={file.extension}
          url={file.url}
          bucketFileId={file.bucketFileId}
          size="md"
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
        onClick={handleCardClick}
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
