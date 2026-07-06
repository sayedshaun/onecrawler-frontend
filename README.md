# OneCrawler UI

A dashboard for running and monitoring [onecrawler](../../) crawls: sitemap discovery, browser-backed link extraction, heuristic/GenAI scraping, content filters, proxies, and browser behavior — all as one shared `Settings` object, mirroring the Python library.

This UI is currently **frontend-only**. All data (dashboard stats, crawl history, live progress) is simulated in the browser via `src/store/crawl-store.ts` — there is no backend wired up yet. The "API not connected" badge in the top bar is a reminder of that. Wiring this up to a real FastAPI backend around `onecrawler` is the next step.

## Requirements

- **Node.js 20+** and npm. This machine didn't have Node installed at the time this project was scaffolded — install it from [nodejs.org](https://nodejs.org/) before continuing.

## Getting started

```bash
cd onecrawler-application/ui
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

Other scripts:

```bash
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build locally
npm run lint      # eslint
```

## What's here

- **Dashboard** — aggregate stats (crawls, pages scraped, success rate, active jobs) and a recent-crawls table.
- **New Crawl** — pick a discovery mode (sitemap / link extraction / full crawler), then configure discovery limits & patterns, scraping strategy (heuristic or GenAI with a schema builder), content filters (`by_date` / `by_keywords` / `by_files` / `by_extension` / `by_cosine_similarity`, composable with AND/OR), proxies, and browser/human-behavior settings. A collapsible "Settings Payload" panel previews the exact JSON that will be sent once the backend exists.
- **Crawl Detail** — live progress bar, throughput chart, discovered-URL stream, results table with a content preview drawer, and a terminal-style log console. Backed by an in-browser simulation loop, not a real crawl.
- **Crawl History** — searchable, filterable list of all jobs.
- **Settings** — default `Settings` values applied to every new crawl, persisted to `localStorage`.

## Project structure

```
src/
  components/
    ui/            shadcn-style primitives (button, card, dialog, select, ...)
    layout/        app shell, sidebar, top bar, theme toggle
    crawl-form/    New Crawl / Settings page form sections
    crawl-detail/  live progress, logs, results, discovered URLs
    dashboard/     dashboard-only widgets
    shared/        cross-page widgets (status badge, crawls table, empty state)
  pages/           one file per route
  store/           zustand stores (simulated crawl engine + persisted defaults)
  lib/
    types.ts       CrawlSettings etc. — mirrors onecrawler's Python Settings shape
    api-mapper.ts  converts UI state to the future backend's snake_case payload
    mock-data.ts   seed data + fake URL/result generators
  providers/       theme provider (light/dark/system)
```

## Connecting a real backend later

`src/lib/api-mapper.ts` already shapes crawl settings into the snake_case payload matching onecrawler's `Settings` kwargs (`link_extraction_limit`, `proxy_rotation_method`, `scraping_output_format`, etc.) — that's the contract the FastAPI backend should accept. The main integration points are:

1. `src/store/crawl-store.ts` — replace `createJob`'s in-memory simulation with a real API call + a WebSocket/SSE subscription for progress ticks.
2. `vite.config.ts` already proxies `/api` to `http://localhost:8000` in dev — point that at wherever the backend runs.
