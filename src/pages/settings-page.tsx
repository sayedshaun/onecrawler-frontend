import { useState } from "react";
import { Check, Key, Layers, Loader2, RotateCcw, Save, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { LinkExtractionSection } from "@/components/crawl-form/link-extraction-section";
import { ScrapingSection } from "@/components/crawl-form/scraping-section";
import { ProxySection } from "@/components/crawl-form/proxy-section";
import { BrowserSection } from "@/components/crawl-form/browser-section";
import { usePolledResource } from "@/hooks/use-polled-resource";
import { ApiError } from "@/lib/api";
import { clearApiKey, listApiKeys, setApiKey } from "@/lib/settings-api";
import { createTemplate, deleteTemplate, listTemplates, updateTemplate } from "@/lib/templates-api";
import { formatRelativeTime } from "@/lib/utils";
import { useSettingsStore } from "@/store/settings-store";
import type { CrawlSettings, CrawlTemplate, GenAIProvider } from "@/lib/types";

const PROVIDERS: { value: GenAIProvider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "google", label: "Google" },
  { value: "ollama", label: "Ollama" },
];

function CrawlTemplatesCard({ defaults }: { defaults: CrawlSettings }) {
  const { data, error, refetch } = usePolledResource(() => listTemplates());
  const templates = data?.items ?? [];

  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CrawlTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await createTemplate(name.trim(), defaults);
      setSaveOpen(false);
      setName("");
      refetch();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to save template.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(template: CrawlTemplate) {
    setUpdatingId(template.id);
    setRowError(null);
    try {
      await updateTemplate(template.id, template.name, defaults);
      refetch();
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : "Failed to update template.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setRowError(null);
    try {
      await deleteTemplate(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : "Failed to delete template.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Crawl Templates</CardTitle>
          <CardDescription>
            Save your current default settings as a reusable template, and apply one when starting a
            new crawl.
          </CardDescription>
        </div>
        <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Save className="h-3.5 w-3.5" /> Save current defaults…
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as template</DialogTitle>
              <DialogDescription>
                Snapshots your current default crawl settings under a name you can reuse later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="template-name">Template name</Label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fast JSON scrape"
              />
            </div>
            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !name.trim()}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {(error || rowError) && <p className="text-sm text-destructive">{error ?? rowError}</p>}

        {templates.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No templates yet"
            description="Save your default settings above to create your first template."
          />
        ) : (
          <div className="space-y-2">
            {templates.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Updated {formatRelativeTime(new Date(t.updatedAt))}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updatingId === t.id}
                    onClick={() => handleUpdate(t)}
                  >
                    {updatingId === t.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    Update from defaults
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteTarget(t)}
                    aria-label="Delete template"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this template?</DialogTitle>
            <DialogDescription>
              This permanently removes{" "}
              <span className="font-medium text-foreground">{deleteTarget?.name}</span>. This can't be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

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
  const defaults = useSettingsStore((s) => s.defaults);
  const setDefaults = useSettingsStore((s) => s.setDefaults);
  const resetDefaults = useSettingsStore((s) => s.resetDefaults);
  const [justReset, setJustReset] = useState(false);

  function patch(p: Partial<CrawlSettings>) {
    setDefaults(p);
  }

  function handleReset() {
    resetDefaults();
    setJustReset(true);
    setTimeout(() => setJustReset(false), 1500);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Default Crawl Settings</CardTitle>
            <CardDescription>
              Applied to every new crawl. Changes save automatically on this device.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            {justReset ? <Check className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
            {justReset ? "Reset" : "Reset to defaults"}
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="discovery">
            <TabsList className="mb-4">
              <TabsTrigger value="discovery">Discovery</TabsTrigger>
              <TabsTrigger value="scraping">Scraping</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="browser">Browser &amp; Behavior</TabsTrigger>
            </TabsList>

            <TabsContent value="discovery">
              <LinkExtractionSection settings={defaults} onChange={patch} />
            </TabsContent>
            <TabsContent value="scraping">
              <ScrapingSection settings={defaults} onChange={patch} />
            </TabsContent>
            <TabsContent value="network">
              <ProxySection settings={defaults} onChange={patch} />
            </TabsContent>
            <TabsContent value="browser">
              <BrowserSection settings={defaults} onChange={patch} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CrawlTemplatesCard defaults={defaults} />
      <ApiKeysCard />
    </div>
  );
}
