import { apiFetch } from "@/lib/api";
import type { ApiKeyStatus, GenAIProvider } from "@/lib/types";

export function listApiKeys(): Promise<ApiKeyStatus[]> {
  return apiFetch("/api/v1/settings/api-keys");
}

export function setApiKey(provider: GenAIProvider, apiKey: string): Promise<ApiKeyStatus> {
  return apiFetch(`/api/v1/settings/api-keys/${provider}`, {
    method: "PUT",
    body: JSON.stringify({ api_key: apiKey }),
  });
}

export function clearApiKey(provider: GenAIProvider): Promise<void> {
  return apiFetch(`/api/v1/settings/api-keys/${provider}`, { method: "DELETE" });
}
