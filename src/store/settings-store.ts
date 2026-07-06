import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_SETTINGS } from "@/lib/defaults";
import type { CrawlSettings } from "@/lib/types";

interface SettingsStore {
  defaults: CrawlSettings;
  setDefaults: (patch: Partial<CrawlSettings>) => void;
  resetDefaults: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      defaults: DEFAULT_SETTINGS,
      setDefaults: (patch) => set((s) => ({ defaults: { ...s.defaults, ...patch } })),
      resetDefaults: () => set({ defaults: DEFAULT_SETTINGS }),
    }),
    { name: "onecrawler-default-settings" },
  ),
);
