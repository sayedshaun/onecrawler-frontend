// Maps the UI's CrawlSettings shape to the snake_case payload that mirrors
// onecrawler's Python `Settings` kwargs (onecrawler/settings/*.py). This is the
// contract the future FastAPI backend is expected to accept.

import type { CrawlSettings } from "@/lib/types";

function parseListField(value: string): string[] | undefined {
  const items = value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}

export function toApiPayload(targetUrl: string, settings: CrawlSettings) {
  const filters = settings.filterGroup.filters.map((f) => {
    switch (f.kind) {
      case "by_date":
        return { kind: f.kind, start: f.params.start || undefined, end: f.params.end || undefined };
      case "by_keywords":
        return { kind: f.kind, keywords: parseListField(f.params.keywords ?? "") };
      case "by_files":
        return { kind: f.kind, types: parseListField(f.params.types ?? "") };
      case "by_extension":
        return { kind: f.kind, extensions: parseListField(f.params.extensions ?? "") };
      case "by_cosine_similarity":
        return {
          kind: f.kind,
          query: f.params.query,
          threshold: Number(f.params.threshold) || 0,
        };
    }
  });

  return {
    target_url: targetUrl,
    mode: settings.mode,
    settings: {
      link_extraction_strategy: settings.linkExtractionStrategy,
      link_extraction_limit: settings.linkExtractionLimit,
      include_link_patterns: settings.includeLinkPatterns.length ? settings.includeLinkPatterns : null,
      exclude_link_patterns: settings.excludeLinkPatterns.length ? settings.excludeLinkPatterns : null,

      scraping_strategy: settings.scrapingStrategy,
      scraping_output_format: settings.scrapingOutputFormat,
      genai: settings.genai
        ? {
            provider: settings.genai.provider,
            model_name: settings.genai.modelName,
            api_key: settings.genai.apiKey || undefined,
            base_url: settings.genai.baseUrl || undefined,
            output_schema: Object.fromEntries(
              settings.genai.schemaFields
                .filter((f) => f.name)
                .map((f) => [f.name, f.optional ? `Optional[${f.type}]` : f.type]),
            ),
          }
        : null,

      concurrency: settings.concurrency,
      max_retries: settings.maxRetries,
      request_timeout: settings.requestTimeout,
      retry_delay: settings.retryDelay,

      proxies: settings.proxies.length ? settings.proxies : null,
      proxy_rotation_method: settings.proxyRotationMethod,

      browser_settings: {
        viewport: settings.browserSettings.viewport,
        locale: settings.browserSettings.locale,
        timezone_id: settings.browserSettings.timezoneId,
        user_agent: settings.browserSettings.userAgent || undefined,
        headless: settings.browserSettings.headless,
        wait_until: settings.browserSettings.waitUntil,
        timeout: settings.browserSettings.timeout,
      },

      enable_human_behaviors: settings.enableHumanBehaviors,
      human_behavior_settings: settings.enableHumanBehaviors
        ? {
            min_delay: settings.humanBehaviorSettings.minDelay,
            max_delay: settings.humanBehaviorSettings.maxDelay,
            max_scrolls: settings.humanBehaviorSettings.maxScrolls,
            min_mouse_moves: settings.humanBehaviorSettings.minMouseMoves,
            max_mouse_moves: settings.humanBehaviorSettings.maxMouseMoves,
          }
        : undefined,
    },
    filters: filters.length ? { mode: settings.filterGroup.mode, chain: filters } : null,
  };
}
