import { useEffect, useState } from "react";
import { Bot, Check, KeyRound, Loader2, Search, Trash2 } from "lucide-react";

import { Field, FieldRow } from "@/components/crawl-form/field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePolledResource } from "@/hooks/use-polled-resource";
import { ApiError } from "@/lib/api";
import { clearAgentConfig, getAgentSettings, setAgentLLMConfig, setAgentSearchConfig } from "@/lib/agents-api";
import { formatRelativeTime } from "@/lib/utils";
import type { AgentLLMProvider } from "@/lib/types";

const PROVIDERS: { value: AgentLLMProvider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google" },
  { value: "openrouter", label: "OpenRouter" },
];

const MODEL_SUGGESTIONS: Record<AgentLLMProvider, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"],
  anthropic: ["claude-sonnet-5", "claude-opus-4-8", "claude-haiku-4-5"],
  google: ["gemini-2.0-flash", "gemini-1.5-pro"],
  openrouter: ["openai/gpt-4o-mini", "anthropic/claude-sonnet-5"],
};

/** The agent's own brain config — a separate LLM provider/key from the GenAI
 * keys used for scraping (above), plus an optional web-search key that backs
 * its web_search tool. Mirrors onecrawler-agents-backend's nested
 * `/api/settings/agent` schema ({ llm, search }, each with its own has_key). */
export function AgentSettingsCard() {
  const { data: settings, error: loadError, refetch } = usePolledResource(getAgentSettings, {
    cacheKey: "agents:settings",
  });

  const [provider, setProvider] = useState<AgentLLMProvider>("openai");
  const [model, setModel] = useState(MODEL_SUGGESTIONS.openai[0]);
  const [llmKey, setLlmKey] = useState("");
  const [savingLlm, setSavingLlm] = useState(false);
  const [clearingLlm, setClearingLlm] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);

  const [searchKey, setSearchKey] = useState("");
  const [savingSearch, setSavingSearch] = useState(false);
  const [clearingSearch, setClearingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Reseed the provider/model fields once the saved settings load in.
  useEffect(() => {
    if (settings?.llm.provider) {
      setProvider(settings.llm.provider);
      setModel(settings.llm.model || MODEL_SUGGESTIONS[settings.llm.provider][0]);
    }
  }, [settings]);

  function handleProviderChange(next: AgentLLMProvider) {
    setProvider(next);
    setModel(MODEL_SUGGESTIONS[next][0]);
  }

  async function handleSaveLlm() {
    const trimmedModel = model.trim() || MODEL_SUGGESTIONS[provider][0];
    const trimmedKey = llmKey.trim();
    if (!trimmedKey) return;
    setSavingLlm(true);
    setLlmError(null);
    try {
      await setAgentLLMConfig({ provider, model: trimmedModel, apiKey: trimmedKey });
      setLlmKey("");
      refetch();
    } catch (err) {
      setLlmError(err instanceof ApiError ? err.message : "Failed to save agent LLM settings.");
    } finally {
      setSavingLlm(false);
    }
  }

  async function handleClearLlm() {
    setClearingLlm(true);
    setLlmError(null);
    try {
      await clearAgentConfig("llm");
      refetch();
    } catch (err) {
      setLlmError(err instanceof ApiError ? err.message : "Failed to clear agent LLM settings.");
    } finally {
      setClearingLlm(false);
    }
  }

  async function handleSaveSearch() {
    const trimmedKey = searchKey.trim();
    if (!trimmedKey) return;
    setSavingSearch(true);
    setSearchError(null);
    try {
      await setAgentSearchConfig({ apiKey: trimmedKey });
      setSearchKey("");
      refetch();
    } catch (err) {
      setSearchError(err instanceof ApiError ? err.message : "Failed to save the search key.");
    } finally {
      setSavingSearch(false);
    }
  }

  async function handleClearSearch() {
    setClearingSearch(true);
    setSearchError(null);
    try {
      await clearAgentConfig("search");
      refetch();
    } catch (err) {
      setSearchError(err instanceof ApiError ? err.message : "Failed to clear the search key.");
    } finally {
      setClearingSearch(false);
    }
  }

  return (
    <Card>
      <CardHeader className="gap-1">
        <CardTitle>Agent Config</CardTitle>
        <CardDescription>
          The Agent tab plans and runs crawls on your behalf — it needs its own LLM provider and key,
          separate from the GenAI keys above. A web-search key is optional and only powers its ability to
          look things up online.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadError && <p className="text-sm text-destructive">{loadError}</p>}

        <div className="space-y-3 rounded-lg border border-border p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Bot className="h-4 w-4" />
            Agent LLM
          </div>

          {llmError && <p className="text-sm text-destructive">{llmError}</p>}

          <FieldRow>
            <Field label="Provider">
              <Select value={provider} onValueChange={(v) => handleProviderChange(v as AgentLLMProvider)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Model">
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={MODEL_SUGGESTIONS[provider][0]}
                list="agent-model-suggestions"
                className="font-mono text-xs"
              />
              <datalist id="agent-model-suggestions">
                {MODEL_SUGGESTIONS[provider].map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </Field>
          </FieldRow>

          <Field label="API key">
            <div className="flex items-center gap-2">
              <Input
                type="password"
                value={llmKey}
                onChange={(e) => setLlmKey(e.target.value)}
                placeholder={settings?.llm.hasKey ? "Enter a new key to replace the saved one" : "sk-..."}
              />
              <Button variant="outline" size="sm" disabled={savingLlm || !llmKey.trim()} onClick={handleSaveLlm}>
                {savingLlm ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                Save
              </Button>
            </div>
          </Field>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              {settings?.llm.hasKey ? (
                <Badge variant="success">
                  <Check className="h-3 w-3" /> Configured
                </Badge>
              ) : (
                <Badge variant="outline">Not configured</Badge>
              )}
              {settings?.llm.hasKey && settings.updatedAt && (
                <span className="text-xs text-muted-foreground">
                  {settings.llm.provider} · {formatRelativeTime(new Date(settings.updatedAt))}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" disabled={!settings?.llm.hasKey || clearingLlm} onClick={handleClearLlm}>
              {clearingLlm ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Clear
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-3 rounded-lg border border-border p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Search className="h-4 w-4" />
            Web Search <span className="font-normal text-muted-foreground">(optional, Tavily)</span>
          </div>

          {searchError && <p className="text-sm text-destructive">{searchError}</p>}

          <Field label="API key">
            <div className="flex items-center gap-2">
              <Input
                type="password"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                placeholder={settings?.search.hasKey ? "Enter a new key to replace the saved one" : "tvly-..."}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={savingSearch || !searchKey.trim()}
                onClick={handleSaveSearch}
              >
                {savingSearch ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <KeyRound className="h-3.5 w-3.5" />
                )}
                Save
              </Button>
            </div>
          </Field>

          <div className="flex items-center justify-between gap-3 pt-1">
            {settings?.search.hasKey ? (
              <Badge variant="success">
                <Check className="h-3 w-3" /> Configured
              </Badge>
            ) : (
              <Badge variant="outline">Not configured</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              disabled={!settings?.search.hasKey || clearingSearch}
              onClick={handleClearSearch}
            >
              {clearingSearch ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
