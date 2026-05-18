"use client";

import { useEffect, useMemo } from "react";
import { Models } from "node-appwrite";
import { AnimatePresence, motion } from "framer-motion";

import Card from "@/components/Card";
import BulkActionsBar from "@/components/BulkActionsBar";
import {
  MultiSelectProvider,
  useMultiSelect,
} from "@/components/MultiSelectProvider";
import { QuickLookProvider } from "@/components/QuickLookProvider";
import QuickLook from "@/components/QuickLook";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

/**
 * Mirrors the surrounding grid's ordered ids into MultiSelectProvider so
 * QuickLook can read them for arrow-key navigation without us threading the
 * array through every render path.
 */
function OrderedIdsSync({ orderedIds }: { orderedIds: string[] }) {
  const multi = useMultiSelect();
  useEffect(() => {
    multi?.setOrderedIds(orderedIds);
  }, [multi, orderedIds]);
  return null;
}

export function FileGrid({ files }: { files: Models.DefaultDocument[] }) {
  // Stable ordered id list — passed to each Card so shift-click range
  // selection sees the same visual order React renders. Recomputed only
  // when the files array identity changes.
  const orderedIds = useMemo(() => files.map((f) => f.$id), [files]);

  return (
    <MultiSelectProvider>
      <QuickLookProvider>
        <OrderedIdsSync orderedIds={orderedIds} />
        <motion.ul
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence>
            {files.map((file) => (
              <Card key={file.$id} file={file} orderedIds={orderedIds} />
            ))}
          </AnimatePresence>
        </motion.ul>
        <BulkActionsBar files={files} />
        <QuickLook files={files} />
      </QuickLookProvider>
    </MultiSelectProvider>
  );
}

export default FileGrid;
