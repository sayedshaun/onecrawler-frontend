import { apiFetch } from "@/lib/api";
import { toApiPayload } from "@/lib/api-mapper";
import { authHeaders } from "@/store/auth-store";
import type {
  CrawlDetail,
  CrawlSettings,
  CrawlSummary,
  DashboardOverview,
  DataItem,
  DataItemDetail,
  DiscoveredUrl,
  LogLine,
  PaginatedResponse,
} from "@/lib/types";

export interface PageParams {
  limit?: number;
  offset?: number;
}

export interface ListCrawlsParams extends PageParams {
  status?: string;
  q?: string;
}

export function listCrawls(params: ListCrawlsParams = {}): Promise<PaginatedResponse<CrawlSummary>> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.q) qs.set("q", params.q);
  qs.set("limit", String(params.limit ?? 20));
  qs.set("offset", String(params.offset ?? 0));
  return apiFetch(`/api/v1/crawls?${qs.toString()}`, { headers: authHeaders() });
}

export function getCrawl(id: string): Promise<CrawlDetail> {
  return apiFetch(`/api/v1/crawls/${id}`, { headers: authHeaders() });
}

export function listDiscoveredUrls(
  id: string,
  params: PageParams = {},
): Promise<PaginatedResponse<DiscoveredUrl>> {
  const qs = new URLSearchParams();
  qs.set("limit", String(params.limit ?? 50));
  qs.set("offset", String(params.offset ?? 0));
  return apiFetch(`/api/v1/crawls/${id}/discovered?${qs.toString()}`, { headers: authHeaders() });
}

export function listCrawlLogs(id: string, params: PageParams = {}): Promise<PaginatedResponse<LogLine>> {
  const qs = new URLSearchParams();
  qs.set("limit", String(params.limit ?? 50));
  qs.set("offset", String(params.offset ?? 0));
  return apiFetch(`/api/v1/crawls/${id}/logs?${qs.toString()}`, { headers: authHeaders() });
}

export function cancelCrawl(id: string): Promise<CrawlSummary> {
  return apiFetch(`/api/v1/crawls/${id}/cancel`, { method: "POST", headers: authHeaders() });
}

export function deleteCrawl(id: string): Promise<void> {
  return apiFetch(`/api/v1/crawls/${id}`, { method: "DELETE", headers: authHeaders() });
}

export function createCrawlFromPayload(payload: unknown): Promise<CrawlSummary> {
  return apiFetch("/api/v1/crawls", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: authHeaders(),
  });
}

export function createCrawl(targetUrl: string, settings: CrawlSettings): Promise<CrawlSummary> {
  return createCrawlFromPayload(toApiPayload(targetUrl, settings));
}

export function getDashboardOverview(): Promise<DashboardOverview> {
  return apiFetch("/api/v1/dashboard/overview", { headers: authHeaders() });
}

export interface ListDataParams extends PageParams {
  jobId?: string;
  format?: string;
  q?: string;
}

export function listData(params: ListDataParams = {}): Promise<PaginatedResponse<DataItem>> {
  const qs = new URLSearchParams();
  if (params.jobId) qs.set("job_id", params.jobId);
  if (params.format) qs.set("format", params.format);
  if (params.q) qs.set("q", params.q);
  qs.set("limit", String(params.limit ?? 50));
  qs.set("offset", String(params.offset ?? 0));
  return apiFetch(`/api/v1/data?${qs.toString()}`, { headers: authHeaders() });
}

export function getDataItem(id: string): Promise<DataItemDetail> {
  return apiFetch(`/api/v1/data/${id}`, { headers: authHeaders() });
}
