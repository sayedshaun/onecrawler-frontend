import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { springUI } from "@/lib/motion";

/** Wraps a card/row so it lifts slightly and gains a shadow on hover — the same
 * effect used on the dashboard stat tiles, applied anywhere a block is a
 * clickable/interactive surface rather than static content. */
export function HoverLift({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={springUI} className={className}>
      {children}
    </motion.div>
  );
}
