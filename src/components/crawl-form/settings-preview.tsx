import { JsonPreview } from "@/components/shared/json-preview";
import { toApiPayload } from "@/lib/api-mapper";
import type { CrawlSettings } from "@/lib/types";

export function SettingsPreview({ targetUrl, settings }: { targetUrl: string; settings: CrawlSettings }) {
  return <JsonPreview value={toApiPayload(targetUrl || "https://example.com", settings)} />;
}
