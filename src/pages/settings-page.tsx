import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkExtractionSection } from "@/components/crawl-form/link-extraction-section";
import { ScrapingSection } from "@/components/crawl-form/scraping-section";
import { ProxySection } from "@/components/crawl-form/proxy-section";
import { BrowserSection } from "@/components/crawl-form/browser-section";
import { useSettingsStore } from "@/store/settings-store";
import type { CrawlSettings } from "@/lib/types";

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
            <TabsList className="mb-4 flex-wrap">
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
    </div>
  );
}
