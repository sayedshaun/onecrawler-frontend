import { useState } from "react";
import { Check, Key, Loader2, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePolledResource } from "@/hooks/use-polled-resource";
import { ApiError } from "@/lib/api";
import { clearApiKey, listApiKeys, setApiKey } from "@/lib/settings-api";
import { formatRelativeTime } from "@/lib/utils";
import type { GenAIProvider } from "@/lib/types";

const PROVIDERS: { value: GenAIProvider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "google", label: "Google" },
  { value: "ollama", label: "Ollama" },
];

function ApiKeysCard() {
  const { data, error, refetch } = usePolledResource(() => listApiKeys());
  const [values, setValues] = useState<Record<string, string>>({});
  const [savingProvider, setSavingProvider] = useState<GenAIProvider | null>(null);
  const [clearingProvider, setClearingProvider] = useState<GenAIProvider | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  function statusFor(provider: GenAIProvider) {
    return data?.find((k) => k.provider === provider) ?? { provider, hasKey: false, updatedAt: null };
  }

  async function handleSave(provider: GenAIProvider) {
    const value = values[provider]?.trim();
    if (!value) return;
    setSavingProvider(provider);
    setRowError(null);
    try {
      await setApiKey(provider, value);
      setValues((prev) => ({ ...prev, [provider]: "" }));
      refetch();
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : "Failed to save API key.");
    } finally {
      setSavingProvider(null);
    }
  }

  async function handleClear(provider: GenAIProvider) {
    setClearingProvider(provider);
    setRowError(null);
    try {
      await clearApiKey(provider);
      refetch();
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : "Failed to clear API key.");
    } finally {
      setClearingProvider(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider API Keys</CardTitle>
        <CardDescription>
          Stored server-side and used for GenAI-based extraction. Keys are never shown again once saved.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {rowError && <p className="text-sm text-destructive">{rowError}</p>}

        {PROVIDERS.map(({ value: provider, label }) => {
          const status = statusFor(provider);
          const saving = savingProvider === provider;
          const clearing = clearingProvider === provider;
          return (
            <div
              key={provider}
              className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-32 items-center gap-2">
                <p className="text-sm font-medium text-foreground">{label}</p>
                {status.hasKey ? (
                  <Badge variant="success">
                    <Check className="h-3 w-3" /> Set
                  </Badge>
                ) : (
                  <Badge variant="outline">Not set</Badge>
                )}
                {status.hasKey && status.updatedAt && (
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(new Date(status.updatedAt))}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="password"
                  value={values[provider] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [provider]: e.target.value }))}
                  placeholder="sk-..."
                  className="w-48"
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={saving || !values[provider]?.trim()}
                  onClick={() => handleSave(provider)}
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Key className="h-3.5 w-3.5" />}
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!status.hasKey || clearing}
                  onClick={() => handleClear(provider)}
                >
                  {clearing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Clear
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <ApiKeysCard />
    </div>
  );
}
