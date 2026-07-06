// Mirrors the onecrawler Python `Settings` object shape (onecrawler/settings/*.py)
// so the future FastAPI backend can accept this payload close to as-is.

export type LinkExtractionStrategy = "shallow" | "deep";
export type ScrapingStrategy = "heuristic" | "genai";
export type ScrapingOutputFormat = "markdown" | "json" | "xml" | "xmltei";
export type ProxyRotationMethod = "round_robin" | "random";
export type GenAIProvider = "openai" | "google" | "ollama";
export type CrawlMode = "sitemap" | "link_extraction" | "crawler";

export interface ProxySettings {
  server: string;
  username?: string;
  password?: string;
}

export interface BrowserSettings {
  viewport: { width: number; height: number };
  locale: string;
  timezoneId: string;
  userAgent?: string;
  headless: boolean;
  waitUntil: "load" | "domcontentloaded" | "networkidle";
  timeout: number;
}

export interface HumanBehaviorSettings {
  minDelay: number;
  maxDelay: number;
  maxScrolls: number;
  minMouseMoves: number;
  maxMouseMoves: number;
}

export interface GenAISchemaField {
  id: string;
  name: string;
  type: "str" | "int" | "float" | "bool" | "list[str]";
  optional: boolean;
}

export interface GenerativeAISettings {
  provider: GenAIProvider;
  modelName: string;
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  schemaFields: GenAISchemaField[];
}

export type FilterKind =
  | "by_date"
  | "by_keywords"
  | "by_files"
  | "by_extension"
  | "by_cosine_similarity";

export interface FilterNode {
  id: string;
  kind: FilterKind;
  params: Record<string, string>;
}

export type FilterGroupMode = "AND" | "OR";

export interface FilterGroup {
  mode: FilterGroupMode;
  filters: FilterNode[];
}

export interface CrawlSettings {
  mode: CrawlMode;

  linkExtractionStrategy: LinkExtractionStrategy;
  linkExtractionLimit: number;
  includeLinkPatterns: string[];
  excludeLinkPatterns: string[];

  scrapingStrategy: ScrapingStrategy;
  scrapingOutputFormat: ScrapingOutputFormat;
  genai?: GenerativeAISettings;

  concurrency: number;
  maxRetries: number;
  requestTimeout: number;
  retryDelay: number;

  proxies: ProxySettings[];
  proxyRotationMethod: ProxyRotationMethod;

  browserSettings: BrowserSettings;

  enableHumanBehaviors: boolean;
  humanBehaviorSettings: HumanBehaviorSettings;

  filterGroup: FilterGroup;
}

export type CrawlStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface DiscoveredUrl {
  id: string;
  url: string;
  discoveredAt: number;
  status: "pending" | "extracted" | "filtered" | "failed";
}

export interface CrawlResultItem {
  id: string;
  url: string;
  title: string;
  wordCount: number;
  format: ScrapingOutputFormat;
  extractedAt: number;
  preview: string;
}

export interface LogLine {
  id: string;
  timestamp: number;
  level: "info" | "warn" | "error" | "debug";
  message: string;
}

export interface ThroughputPoint {
  t: number;
  pagesPerSec: number;
}

// Mirrors backend CrawlJobSummaryOut (src/api/v1/crawler/*/schema.py)
export interface CrawlSummary {
  id: string;
  targetUrl: string;
  status: CrawlStatus;
  mode: CrawlMode;
  createdAt: number;
  startedAt?: number | null;
  finishedAt?: number | null;
  urlsDiscovered: number;
  urlsScraped: number;
  urlsFailed: number;
  urlLimit: number;
  error?: string | null;
}

// Mirrors backend CrawlJobDetailOut — `settings` is the raw create-request
// payload (snake_case) as stored, not the UI's CrawlSettings shape.
// Discovered URLs, results, and logs are fetched separately (paginated) —
// see listDiscoveredUrls / listData / listCrawlLogs in crawls-api.ts.
export interface CrawlDetail extends CrawlSummary {
  settings: Record<string, unknown>;
  throughputHistory: ThroughputPoint[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface DashboardOverview {
  totalJobs: number;
  jobCounts: Record<CrawlStatus, number>;
  urlsDiscovered: number;
  urlsScraped: number;
  urlsFailed: number;
  recentJobs: Array<
    Pick<CrawlSummary, "id" | "targetUrl" | "status" | "mode" | "createdAt" | "urlsDiscovered" | "urlsScraped">
  >;
}

// Mirrors backend DataItemOut / DataItemDetailOut (src/api/v1/data/*/schema.py)
export interface DataItem {
  id: string;
  jobId: string;
  targetUrl: string;
  url: string;
  title: string;
  wordCount: number;
  format: ScrapingOutputFormat;
  extractedAt: number;
  preview: string;
}

export interface DataItemDetail extends DataItem {
  content: string;
}
