import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { transitionPage } from "@/lib/motion";

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionPage}
            className="mx-auto min-h-full w-full max-w-screen-2xl"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
