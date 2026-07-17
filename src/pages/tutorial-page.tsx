import { Link } from "react-router-dom";
import {
  Lightbulb,
  Map,
  Rocket,
  ScanSearch,
  Sparkles,
  SquarePlus,
  Waypoints,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QUICK_START = [
  {
    title: "Start a new crawl",
    body: "Open New Crawl, paste a target URL, and choose a mode: sitemap discovery, link extraction, or full crawler.",
  },
  {
    title: "Configure the strategy",
    body: "Set concurrency, URL filters, and proxy rotation. Add a GenAI schema for typed output — or start from a saved template.",
  },
  {
    title: "Watch it run live",
    body: "Follow throughput, progress, discovered URLs, and a live log from the crawl detail page as pages are extracted.",
  },
  {
    title: "Export your results",
    body: "Filter the extracted data and export to Markdown, JSON, XML, or TEI — including bulk export of the rows you select.",
  },
];

const WORKFLOW = [
  {
    icon: Map,
    title: "Sitemap discovery",
    body: "Start with UniversalSiteMap — the fastest, cheapest way to collect URLs from a well-maintained site.",
  },
  {
    icon: Waypoints,
    title: "Browser link extraction",
    body: "Fall back to LinkExtractor when sitemap coverage is missing or the site renders its links via JavaScript.",
  },
  {
    icon: ScanSearch,
    title: "Heuristic scraping",
    body: "Scrape the final URL list with fast, deterministic heuristic extraction by default — no model calls needed.",
  },
  {
    icon: Sparkles,
    title: "GenAI extraction",
    body: "Reach for GenAI extraction only when you need typed, schema-shaped output from unstructured pages.",
  },
];

const TIPS = [
  "Prefer sitemap discovery first — it's the cheapest way to enumerate a site's URLs.",
  "Use URL filters to skip pagination, tag pages, and other low-value routes.",
  "Enable proxy rotation on large crawls to avoid rate limits and blocks.",
  "Save configurations you reuse as templates to launch new crawls faster.",
  "Heuristic extraction is fast — switch to GenAI only when you need structured fields.",
  "Watch the dashboard success rate to catch sites that need tuning.",
];

export default function TutorialPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Getting started with OneCrawler
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Turn any website into structured data in four steps — from URL discovery to a clean,
              exportable dataset.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link to="/dashboard/crawls/new">
            <SquarePlus className="h-4 w-4" />
            New Crawl
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick start</CardTitle>
            <CardDescription>Four steps to your first structured dataset.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {QUICK_START.map((step, i) => (
              <div key={step.title} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {i + 1}
                  </div>
                  {i < QUICK_START.length - 1 && <div className="mt-1 h-full w-px flex-1 bg-border" />}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended workflow</CardTitle>
            <CardDescription>How onecrawler is designed to be used.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {WORKFLOW.map((step, i) => (
              <div key={step.title} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon className="h-4 w-4" />
                  </div>
                  {i < WORKFLOW.length - 1 && <div className="mt-1 h-full w-px flex-1 bg-border" />}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tips &amp; best practices</CardTitle>
          <CardDescription>Small habits that make crawls faster and cheaper.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2">
            {TIPS.map((tip) => (
              <li key={tip} className="flex gap-2.5 text-sm text-muted-foreground">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
