import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Globe } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeSelector } from "@/components/crawl-form/mode-selector";
import { LinkExtractionSection } from "@/components/crawl-form/link-extraction-section";
import { ScrapingSection } from "@/components/crawl-form/scraping-section";
import { FilterChainBuilder } from "@/components/crawl-form/filter-chain-builder";
import { ProxySection } from "@/components/crawl-form/proxy-section";
import { BrowserSection } from "@/components/crawl-form/browser-section";
import { LaunchSummary } from "@/components/crawl-form/launch-summary";
import { SettingsPreview } from "@/components/crawl-form/settings-preview";
import { ApiError } from "@/lib/api";
import { createCrawl } from "@/lib/crawls-api";
import { useSettingsStore } from "@/store/settings-store";
import type { CrawlSettings } from "@/lib/types";

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export default function NewCrawlPage() {
  const navigate = useNavigate();
  const defaults = useSettingsStore((s) => s.defaults);

  const [targetUrl, setTargetUrl] = useState("");
  const [settings, setSettings] = useState<CrawlSettings>(() => JSON.parse(JSON.stringify(defaults)));
  const [previewOpen, setPreviewOpen] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  function patchSettings(patch: Partial<CrawlSettings>) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  async function handleLaunch() {
    const url = normalizeUrl(targetUrl);
    if (!url) return;
    setLaunching(true);
    setLaunchError(null);
    try {
      const job = await createCrawl(url, settings);
      navigate(`/dashboard/crawls/${job.id}`);
    } catch (err) {
      setLaunchError(err instanceof ApiError ? err.message : "Failed to start crawl.");
      setLaunching(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Target &amp; Strategy</CardTitle>
            <CardDescription>What to crawl and how to discover its URLs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="target-url">Target URL</Label>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="target-url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="example.com/blog"
                  className="pl-9"
                />
              </div>
            </div>

            <ModeSelector value={settings.mode} onChange={(mode) => patchSettings({ mode })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>
              Shared configuration across discovery, scraping, and browser behavior.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="discovery">
              <TabsList className="mb-4 flex-wrap">
                <TabsTrigger value="discovery">Discovery</TabsTrigger>
                <TabsTrigger value="scraping">Scraping</TabsTrigger>
                <TabsTrigger value="filters">Filters</TabsTrigger>
                <TabsTrigger value="network">Network</TabsTrigger>
                <TabsTrigger value="browser">Browser &amp; Behavior</TabsTrigger>
              </TabsList>

              <TabsContent value="discovery">
                <LinkExtractionSection settings={settings} onChange={patchSettings} />
              </TabsContent>
              <TabsContent value="scraping">
                <ScrapingSection settings={settings} onChange={patchSettings} />
              </TabsContent>
              <TabsContent value="filters">
                <FilterChainBuilder
                  group={settings.filterGroup}
                  onChange={(filterGroup) => patchSettings({ filterGroup })}
                />
              </TabsContent>
              <TabsContent value="network">
                <ProxySection settings={settings} onChange={patchSettings} />
              </TabsContent>
              <TabsContent value="browser">
                <BrowserSection settings={settings} onChange={patchSettings} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <button
            type="button"
            onClick={() => setPreviewOpen((v) => !v)}
            className="flex w-full items-center justify-between p-5 text-left"
          >
            <div>
              <CardTitle>Settings Payload</CardTitle>
              <CardDescription className="mt-1">
                Preview of the request this will send once the API is connected.
              </CardDescription>
            </div>
            <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${previewOpen ? "rotate-180" : ""}`} />
          </button>
          {previewOpen && (
            <CardContent className="pt-0">
              <SettingsPreview targetUrl={normalizeUrl(targetUrl)} settings={settings} />
            </CardContent>
          )}
        </Card>
      </div>

      <div>
        <LaunchSummary
          targetUrl={normalizeUrl(targetUrl)}
          settings={settings}
          disabled={!targetUrl.trim()}
          launching={launching}
          error={launchError}
          onLaunch={handleLaunch}
        />
      </div>
    </div>
  );
}
