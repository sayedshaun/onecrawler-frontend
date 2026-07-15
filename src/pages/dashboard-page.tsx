import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  FileStack,
  ListChecks,
  Map,
  Radar,
  ScanSearch,
  SquarePlus,
  Sparkles,
  Waypoints,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBreakdownChart } from "@/components/dashboard/status-breakdown-chart";
import { CrawlsTable } from "@/components/shared/crawls-table";
import { EmptyState } from "@/components/shared/empty-state";
import { HoverLift } from "@/components/shared/hover-lift";
import { usePolledResource } from "@/hooks/use-polled-resource";
import { getDashboardOverview, listCrawls } from "@/lib/crawls-api";
import { formatNumber } from "@/lib/utils";
import type { CrawlStatus } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";

const TREND_HISTORY_LIMIT = 20;

const WORKFLOW_STEPS = [
  {
    icon: Map,
    title: "Sitemap discovery",
    body: "Start with UniversalSiteMap — the fastest, cheapest way to collect URLs from a well-maintained site.",
  },
  {
    icon: Waypoints,
    title: "Browser link extraction",
    body: "Fall back to LinkExtractor when sitemap coverage is missing or the site renders links via JavaScript.",
  },
  {
    icon: ScanSearch,
    title: "Heuristic scraping",
    body: "Scrape the final URL list with fast, deterministic heuristic extraction by default.",
  },
  {
    icon: Sparkles,
    title: "GenAI extraction",
    body: "Reach for GenAI extraction only when you need typed, schema-shaped output.",
  },
];

const RECENT_LIMIT = 6;

const DEFAULT_JOB_COUNTS: Record<CrawlStatus, number> = {
  queued: 0,
  running: 0,
  completed: 0,
  failed: 0,
  cancelled: 0,
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = (user?.name || user?.email || "").split(/[\s@]/)[0];
  const { data: overview, error: overviewError } = usePolledResource(getDashboardOverview, {
    intervalMs: 5000,
    cacheKey: "dashboard:overview",
  });
  const { data: recentPage } = usePolledResource(() => listCrawls({ limit: RECENT_LIMIT }), {
    intervalMs: 5000,
    cacheKey: "dashboard:recent",
  });

  const totalScraped = overview?.urlsScraped ?? 0;
  const totalFailed = overview?.urlsFailed ?? 0;
  const successRate =
    totalScraped + totalFailed > 0 ? Math.round((totalScraped / (totalScraped + totalFailed)) * 100) : 100;
  const running = overview?.jobCounts.running ?? 0;

  const recent = recentPage?.items ?? [];

  // Live sparkline: no historical endpoint exists yet, so this samples each poll
  // of the real overview as it arrives rather than fabricating a trend.
  const [scrapedTrend, setScrapedTrend] = useState<number[]>([]);
  const lastSampledRef = useRef<number | null>(null);
  useEffect(() => {
    if (!overview || overview.urlsScraped === lastSampledRef.current) return;
    lastSampledRef.current = overview.urlsScraped;
    setScrapedTrend((prev) => [...prev, overview.urlsScraped].slice(-TREND_HISTORY_LIMIT));
  }, [overview]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening across your crawls.
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/crawls/new">
            <SquarePlus className="h-4 w-4" />
            New Crawl
          </Link>
        </Button>
      </div>

      {overviewError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{overviewError}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Crawls"
          value={formatNumber(overview?.totalJobs ?? 0)}
          hint="All time"
          icon={Radar}
        />
        <StatCard
          label="Pages Scraped"
          value={formatNumber(totalScraped)}
          hint="Across all crawls"
          icon={FileStack}
          trend={scrapedTrend}
        />
        <StatCard
          label="Success Rate"
          value={`${successRate}%`}
          hint="Extracted vs. failed"
          icon={CheckCircle2}
          tone={successRate >= 90 ? "success" : "warning"}
        />
        <StatCard
          label="Active Now"
          value={formatNumber(running)}
          hint={running > 0 ? "Crawling in progress" : "No crawls running"}
          icon={ListChecks}
          tone={running > 0 ? "success" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <HoverLift className="xl:col-span-2">
          <Card className="h-full transition-shadow duration-150 ease-out hover:shadow-md">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Crawls</CardTitle>
              <CardDescription>Your most recently started jobs</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/crawls">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recent.length > 0 ? (
              <CrawlsTable jobs={recent} />
            ) : (
              <EmptyState
                icon={Radar}
                title="No crawls yet"
                description="Start your first crawl to see live progress and results here."
                action={
                  <Button asChild size="sm">
                    <Link to="/dashboard/crawls/new">New Crawl</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
          </Card>
        </HoverLift>

        <div className="space-y-4">
          <HoverLift>
          <Card className="transition-shadow duration-150 ease-out hover:shadow-md">
            <CardHeader>
              <CardTitle>Crawl Status</CardTitle>
              <CardDescription>All jobs, by current status</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusBreakdownChart jobCounts={overview?.jobCounts ?? DEFAULT_JOB_COUNTS} />
            </CardContent>
          </Card>
          </HoverLift>

          <HoverLift>
          <Card className="transition-shadow duration-150 ease-out hover:shadow-md">
            <CardHeader>
              <CardTitle>Recommended Workflow</CardTitle>
              <CardDescription>How onecrawler is designed to be used</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {WORKFLOW_STEPS.map((step, i) => (
                <div key={step.title} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <step.icon className="h-3.5 w-3.5" />
                    </div>
                    {i < WORKFLOW_STEPS.length - 1 && (
                      <div className="mt-1 h-full w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-medium text-foreground">{step.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          </HoverLift>
        </div>
      </div>
    </div>
  );
}
