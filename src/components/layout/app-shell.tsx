import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import { TopBar } from "@/components/layout/topbar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { transitionPage } from "@/lib/motion";

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  // Touch devices (phones/tablets) get no page-enter animation — animating
  // opacity/transform is more likely to visibly stutter on a mobile GPU.
  // Desktop pointers keep the subtle transition.
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const animatePages = !reduceMotion && !coarsePointer;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <TopBar />
      <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
        {/*
          No AnimatePresence/exit animation here on purpose: an exit animation makes
          AnimatePresence delay mounting the next page until the old one finishes
          leaving, which added real navigation latency (compounding on rapid clicks).
          The old page unmounts instantly; only the new one animates in.
        */}
        <motion.div
          key={location.pathname}
          initial={animatePages ? { opacity: 0, y: 6 } : false}
          animate={animatePages ? { opacity: 1, y: 0 } : undefined}
          transition={transitionPage}
          className="mx-auto min-h-full w-full max-w-screen-2xl"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
