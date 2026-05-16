"use client";

import { Models } from "node-appwrite";
import { AnimatePresence, motion } from "framer-motion";

import Card from "@/components/Card";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

export function FileGrid({ files }: { files: Models.DefaultDocument[] }) {
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <AnimatePresence>
        {files.map((file) => (
          <Card key={file.$id} file={file} />
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}

export default FileGrid;
