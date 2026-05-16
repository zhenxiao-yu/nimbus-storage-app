"use client";

import Link from "next/link";
import { Models } from "node-appwrite";
import { motion, type Variants } from "framer-motion";

import ActionDropdown from "@/components/ActionDropdown";
import Thumbnail from "@/components/Thumbnail";
import { cn, convertFileSize, formatRelativeTime } from "@/lib/utils";

const typeChipStyles: Record<string, string> = {
  document:
    "bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-300",
  image:
    "bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-300",
  video: "bg-pink-500/10 text-pink-600 ring-pink-500/20 dark:text-pink-300",
  audio: "bg-pink-500/10 text-pink-600 ring-pink-500/20 dark:text-pink-300",
  other:
    "bg-zinc-500/10 text-zinc-600 ring-zinc-500/20 dark:text-zinc-300",
};

const typeLabel: Record<string, string> = {
  document: "Doc",
  image: "Image",
  video: "Media",
  audio: "Media",
  other: "Other",
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 380, damping: 30 },
  },
};

export function RecentUploadsList({
  files,
}: {
  files: Models.DefaultDocument[];
}) {
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
      className="divide-y divide-border/60"
    >
      {files.map((file) => {
        const t = (file.type as string) ?? "other";
        const chipClass = typeChipStyles[t] ?? typeChipStyles.other;
        const chipText = typeLabel[t] ?? "File";

        return (
          <motion.li
            key={file.$id}
            variants={item}
            className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="shrink-0">
              <Thumbnail
                type={file.type}
                extension={file.extension}
                url={file.url}
              />
            </div>

            <Link
              href={file.url}
              target="_blank"
              rel="noreferrer noopener"
              className="ring-focus min-w-0 flex-1 rounded-md"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset",
                    chipClass,
                  )}
                >
                  {chipText}
                </span>
                <p className="min-w-0 flex-1 truncate text-sm font-medium transition-colors group-hover:text-primary">
                  {file.name}
                </p>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                <span>{formatRelativeTime(file.$createdAt)}</span>
                <span className="mx-1.5 text-border">·</span>
                <span className="tabular-nums">
                  {convertFileSize(file.size)}
                </span>
              </p>
            </Link>

            <div className="shrink-0 opacity-60 transition-opacity group-hover:opacity-100">
              <ActionDropdown file={file} />
            </div>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

export default RecentUploadsList;
