"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight, FileText, Film, FolderArchive, ImageIcon } from "lucide-react";

import FormattedDateTime from "@/components/FormattedDateTime";
import { Separator } from "@/components/ui/separator";
import { TOTAL_BUCKET_SIZE } from "@/constants";
import { convertFileSize } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Documents: FileText,
  Images: ImageIcon,
  Media: Film,
  Others: FolderArchive,
};

const accentMap: Record<string, { bar: string; chip: string }> = {
  Documents: { bar: "bg-sky-500", chip: "bg-sky-500/10 text-sky-600 dark:text-sky-300" },
  Images: {
    bar: "bg-violet-500",
    chip: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  },
  Media: { bar: "bg-pink-500", chip: "bg-pink-500/10 text-pink-600 dark:text-pink-300" },
  Others: { bar: "bg-zinc-500", chip: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300" },
};

export interface SummaryItem {
  title: string;
  size: number;
  latestDate: string;
  url: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 28 },
  },
};

export function SummaryCards({ items }: { items: SummaryItem[] }) {
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4"
    >
      {items.map((summary) => {
        const Icon = iconMap[summary.title] ?? FolderArchive;
        const accent = accentMap[summary.title] ?? accentMap.Others;
        const pct = Math.min(100, (summary.size / TOTAL_BUCKET_SIZE) * 100);
        return (
          <motion.li key={summary.title} variants={item}>
            <Link
              href={summary.url}
              className="group flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-elevated"
            >
              <div className="flex items-start justify-between">
                <span
                  className={
                    "flex size-11 items-center justify-center rounded-xl " +
                    accent.chip
                  }
                >
                  <Icon className="size-5" />
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>

              <div className="mt-6 space-y-1">
                <p className="text-2xl font-semibold tracking-tight tabular-nums">
                  {convertFileSize(summary.size) || "0 B"}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  {summary.title}
                </p>
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
                    className={"h-full rounded-full " + accent.bar}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="tabular-nums">{pct.toFixed(1)}% of bucket</span>
                </div>
              </div>

              <Separator className="my-3" />
              <FormattedDateTime
                date={summary.latestDate}
                className="text-xs"
              />
            </Link>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

export default SummaryCards;
