"use client";

import { Models } from "node-appwrite";
import { AnimatePresence, motion } from "framer-motion";

import TrashCard from "@/components/TrashCard";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.04 },
  },
};

export function TrashList({ files }: { files: Models.DefaultDocument[] }) {
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <AnimatePresence>
        {files.map((file) => (
          <TrashCard key={file.$id} file={file} />
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}

export default TrashList;
