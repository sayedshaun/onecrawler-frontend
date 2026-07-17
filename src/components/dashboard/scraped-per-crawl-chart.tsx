import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatNumber } from "@/lib/utils";
import type { CrawlSummary } from "@/lib/types";

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Stacked bars of scraped vs. failed pages for the most recent crawls — a
 * per-crawl view of extraction volume and where failures cluster. */
export function ScrapedPerCrawlChart({ jobs }: { jobs: CrawlSummary[] }) {
  // Recent list is newest-first; reverse so the chart reads left→right in time.
  const data = jobs
    .slice(0, 6)
    .reverse()
    .map((j) => ({ name: domainOf(j.targetUrl), scraped: j.urlsScraped, failed: j.urlsFailed }));

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        No crawls yet — extraction volume will appear here.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }} barSize={26}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            interval={0}
            tickFormatter={(v: string) => (v.length > 12 ? `${v.slice(0, 11)}…` : v)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={36}
            tickFormatter={(v: number) => formatNumber(v)}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value: number, name) => [
              formatNumber(value),
              name === "scraped" ? "Scraped" : "Failed",
            ]}
          />
          <Bar dataKey="scraped" stackId="a" fill="hsl(var(--primary))" isAnimationActive={false} />
          <Bar
            dataKey="failed"
            stackId="a"
            fill="hsl(var(--destructive))"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
