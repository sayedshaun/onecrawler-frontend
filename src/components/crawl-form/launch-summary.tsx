import { Loader2, Rocket, Globe2, Gauge, ListFilter, Shield, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CrawlSettings } from "@/lib/types";

const MODE_LABEL: Record<CrawlSettings["mode"], string> = {
  sitemap: "Sitemap Discovery",
  link_extraction: "Link Extraction",
  crawler: "Full Crawler",
};

export function LaunchSummary({
  targetUrl,
  settings,
  disabled,
  launching,
  error,
  onLaunch,
}: {
  targetUrl: string;
  settings: CrawlSettings;
  disabled: boolean;
  launching?: boolean;
  error?: string | null;
  onLaunch: () => void;
}) {
  const filterCount = settings.filterGroup.filters.length;

  const rows = [
    { icon: Globe2, label: "Mode", value: MODE_LABEL[settings.mode] },
    { icon: Gauge, label: "Concurrency", value: `${settings.concurrency} workers · limit ${settings.linkExtractionLimit}` },
    {
      icon: Sparkles,
      label: "Extraction",
      value:
        settings.scrapingStrategy === "genai"
          ? `GenAI · ${settings.genai?.modelName ?? ""}`
          : `Heuristic · ${settings.scrapingOutputFormat}`,
    },
    { icon: Shield, label: "Proxies", value: settings.proxies.length ? `${settings.proxies.length} configured` : "None (direct)" },
    { icon: ListFilter, label: "Filters", value: filterCount ? `${filterCount} active (${settings.filterGroup.mode})` : "None" },
  ];

  return (
    <Card className="sticky top-20 card-glow">
      <CardHeader>
        <CardTitle>Launch</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Target</p>
          <p className="truncate font-mono text-xs text-foreground">
            {targetUrl || "https://example.com"}
          </p>
        </div>

        <div className="space-y-2.5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <row.icon className="h-3.5 w-3.5" />
                {row.label}
              </span>
              <span className="font-medium text-foreground">{row.value}</span>
            </div>
          ))}
        </div>

        <Separator />

        <Button className="w-full" size="lg" disabled={disabled || launching} onClick={onLaunch}>
          {launching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
          {launching ? "Starting…" : "Start Crawl"}
        </Button>
        {disabled && !launching && (
          <p className="text-center text-xs text-muted-foreground">
            Enter a target URL to continue.
          </p>
        )}
        {error && <p className="text-center text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
