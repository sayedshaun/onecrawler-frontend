import { apiFetch } from "@/lib/api";
import { buildSettingsPayload } from "@/lib/api-mapper";
import type { CrawlSettings, CrawlTemplate } from "@/lib/types";

export interface CrawlTemplateList {
  items: CrawlTemplate[];
  total: number;
}

export function listTemplates(): Promise<CrawlTemplateList> {
  return apiFetch("/api/v1/settings/templates");
}

export function createTemplate(name: string, settings: CrawlSettings): Promise<CrawlTemplate> {
  const { settings: settingsPayload, filters } = buildSettingsPayload(settings);
  return apiFetch("/api/v1/settings/templates", {
    method: "POST",
    body: JSON.stringify({ name, settings: settingsPayload, filters }),
  });
}

export function updateTemplate(id: string, name: string, settings: CrawlSettings): Promise<CrawlTemplate> {
  const { settings: settingsPayload, filters } = buildSettingsPayload(settings);
  return apiFetch(`/api/v1/settings/templates/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name, settings: settingsPayload, filters }),
  });
}

export function deleteTemplate(id: string): Promise<void> {
  return apiFetch(`/api/v1/settings/templates/${id}`, { method: "DELETE" });
}
