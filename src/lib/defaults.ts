import type { CrawlSettings } from "@/lib/types";

export const DEFAULT_SETTINGS: CrawlSettings = {
  mode: "sitemap",

  linkExtractionStrategy: "deep",
  linkExtractionLimit: 50,
  includeLinkPatterns: [],
  excludeLinkPatterns: [],

  scrapingStrategy: "heuristic",
  scrapingOutputFormat: "json",
  genai: undefined,

  concurrency: 10,
  maxRetries: 2,
  requestTimeout: 10,
  retryDelay: 1,

  proxies: [],
  proxyRotationMethod: "round_robin",

  browserSettings: {
    viewport: { width: 1366, height: 768 },
    locale: "en-US",
    timezoneId: "Asia/Dhaka",
    userAgent: "",
    headless: true,
    waitUntil: "domcontentloaded",
    timeout: 30000,
  },

  enableHumanBehaviors: false,
  humanBehaviorSettings: {
    minDelay: 0.3,
    maxDelay: 1.2,
    maxScrolls: 50,
    minMouseMoves: 5,
    maxMouseMoves: 15,
  },

  filterGroup: {
    mode: "AND",
    filters: [],
  },
};

export function cloneDefaultSettings(): CrawlSettings {
  return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}
