"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 28 } },
};

export function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      <AnimatePresence>{children}</AnimatePresence>
    </motion.ul>
  );
}

export function StaggerItem({
  children,
  className,
  layoutId,
}: {
  children: React.ReactNode;
  className?: string;
  layoutId?: string;
}) {
  return (
    <motion.li
      layout
      layoutId={layoutId}
      variants={item}
      exit={{ opacity: 0, scale: 0.92, y: -8 }}
      className={className}
    >
      {children}
    </motion.li>
  );
}
