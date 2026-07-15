import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Compass,
  FileJson,
  Layers,
  MousePointerClick,
  Radar,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveDot } from "@/components/shared/live-dot";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const FEATURES = [
  {
    icon: Compass,
    title: "Sitemap & link discovery",
    description: "Point OneCrawler at a domain and let it map sitemaps or follow links to find every page worth scraping.",
  },
  {
    icon: Layers,
    title: "Shallow, deep, or full crawler mode",
    description: "Pick the extraction strategy that matches the job — from a single page to an entire site.",
  },
  {
    icon: Sparkles,
    title: "Heuristic or GenAI extraction",
    description: "Extract with fast heuristics, or hand a page to an LLM with a structured output schema.",
  },
  {
    icon: FileJson,
    title: "Markdown, JSON, XML, or TEI",
    description: "Get results in the format your pipeline already expects — no post-processing required.",
  },
  {
    icon: ShieldCheck,
    title: "Proxy rotation built in",
    description: "Round-robin or random proxy rotation keeps long crawls running without getting blocked.",
  },
  {
    icon: MousePointerClick,
    title: "Human-like behavior",
    description: "Randomized delays, scrolling, and mouse movement make automated browsing look natural.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Point it at a URL",
    description: "Give OneCrawler a target and choose sitemap, link extraction, or full crawler mode.",
  },
  {
    step: "02",
    title: "Configure the strategy",
    description: "Set concurrency, filters, proxies, and an optional GenAI schema — or just use the defaults.",
  },
  {
    step: "03",
    title: "Get structured results",
    description: "Watch progress live, then pull clean, structured data out in the format you need.",
  },
];

function PublicNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Radar className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">OneCrawler</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <a href="#features" className="transition-colors duration-150 ease-out hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="transition-colors duration-150 ease-out hover:text-foreground">
            How it works
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/signup">Sign up free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function HeroPreviewCard() {
  return (
    <div className="card-glow relative rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
        </div>
        <Badge variant="success" className="gap-1.5">
          <LiveDot className="bg-success" />
          Running
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 py-4 sm:gap-3">
        {[
          { label: "Discovered", value: "1,204" },
          { label: "Scraped", value: "958" },
          { label: "Failed", value: "12" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg bg-muted/60 p-2 sm:p-3">
            <p className="text-base font-semibold tabular-nums text-foreground sm:text-lg">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-lg border border-border bg-background/60 p-3 font-mono text-[11px] text-muted-foreground">
        <p>
          <span className="text-success">✓</span> Extracted /blog/scaling-crawlers
        </p>
        <p>
          <span className="text-success">✓</span> Extracted /docs/getting-started
        </p>
        <p className="text-foreground">
          <span className="animate-pulse text-primary">›</span> Crawling /pricing …
        </p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 10%, hsl(var(--primary) / 0.14), transparent 45%), radial-gradient(circle at 85% 25%, hsl(var(--primary) / 0.1), transparent 40%)",
          }}
        />

        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div>
            <Badge variant="outline" className="gap-1.5">
              <Sparkles className="h-3 w-3" />
              Now with GenAI-powered extraction
            </Badge>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Turn any website into <span className="text-gradient">structured data</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              OneCrawler discovers pages, extracts content with heuristics or an LLM, and hands you clean
              Markdown, JSON, or XML — with proxy rotation and human-like behavior built in.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/signup">
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">Log in</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["No credit card required", "Self-hostable", "Open configuration"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <HeroPreviewCard />
        </div>
      </section>

      <section id="features" className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Everything you need to crawl at scale
            </h2>
            <p className="mt-3 text-muted-foreground">
              One crawler, configured for the job — from a quick scrape to a full site extraction pipeline.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20">
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Three steps to structured data</h2>
            <p className="mt-3 text-muted-foreground">No pipelines to wire up. No scripts to babysit.</p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {STEPS.map(({ step, title, description }) => (
              <div key={step} className="relative">
                <span className="text-sm font-semibold text-primary/60">{step}</span>
                <h3 className="mt-2 text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20">
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
          <div className="card-glow flex flex-col items-center gap-6 rounded-2xl border border-border bg-card px-6 py-14 text-center">
            <Zap className="h-8 w-8 text-primary" />
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-foreground">
              Ready to start crawling smarter?
            </h2>
            <p className="max-w-md text-muted-foreground">
              Create a free account and launch your first crawl in minutes.
            </p>
            <Button asChild size="lg">
              <Link to="/signup">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Radar className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium text-foreground">OneCrawler</span>
          </div>
          <p>© {new Date().getFullYear()} OneCrawler. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
