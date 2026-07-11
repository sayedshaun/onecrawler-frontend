# OneCrawler UI

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-state-593d88?logo=react&logoColor=white)](https://github.com/pmndrs/zustand)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com)

![OneCrawler demo](.github/demo.gif)

A dashboard for running and monitoring [onecrawler](../../) crawls: sitemap discovery, browser-backed link extraction, heuristic/GenAI scraping, content filters, proxies, and browser behavior — all as one shared `Settings` object, mirroring the Python library.

The UI talks to a real FastAPI backend (a sibling `onecrawler-backend` project) over a REST API, with the crawl detail page polling for live progress, throughput, and results as a job runs.

## What's here

- **Landing page** — public marketing page at `/`.
- **Auth** — email/password login and signup, JWT-based, persisted in `localStorage`.
- **Dashboard** — aggregate stats (crawls, pages scraped, success rate, active jobs) and a recent-crawls table.
- **New Crawl** — pick a discovery mode (sitemap / link extraction / full crawler / direct scraper), then configure discovery limits & patterns, scraping strategy (heuristic or GenAI with a schema builder), content filters (`by_date` / `by_keywords` / `by_files` / `by_extension` / `by_cosine_similarity`, composable with AND/OR), proxies, and browser/human-behavior settings. A collapsible "Settings Payload" panel previews the exact JSON sent to the backend.
- **Crawl Detail** — live progress bar, throughput chart, discovered-URL stream, results table with a content preview drawer, and a terminal-style log console.
- **Crawl History** — searchable, filterable list of all jobs.
- **Extracted Data** — a global, cross-crawl browser for every scraped result, filterable by format, with the same content preview drawer.
- **Settings** — default `Settings` values applied to every new crawl, persisted to `localStorage`.

## Requirements

- **Node.js 20+** and npm, **or** Docker.
- A running `onecrawler-backend` instance (FastAPI + Postgres + Redis + an arq worker) — this UI has no functionality of its own without it.

## Getting started

### With Docker (recommended)

```bash
docker compose -f docker-compose.dev.yml up
```

This builds the `dev` stage of the `Dockerfile` and starts a hot-reloading Vite dev server on `http://localhost:5173`, with `/api` proxied per `API_PROXY_TARGET` in `.env` (defaults to `http://host.docker.internal:8000`, i.e. a backend running on your host machine).

For a production-like preview instead — a static build served by Caddy, with `/api` reverse-proxied the same way — use `docker compose up` (no `-f`) instead, which serves on `http://localhost:8080`.

### With Node directly

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`). Point `vite.config.ts`'s dev proxy (or `API_PROXY_TARGET`) at wherever `onecrawler-backend` is running.

Other scripts:

```bash
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build locally
npm run lint      # eslint
```

## Project structure

```
src/
  components/
    ui/            shadcn-style primitives (button, card, dialog, select, ...)
    layout/        app shell, sidebar, top bar, theme toggle
    auth/          shared login/signup layout
    routing/       route guards (ProtectedRoute)
    crawl-form/    New Crawl / Settings page form sections
    crawl-detail/  live progress, logs, results, discovered URLs
    dashboard/     dashboard-only widgets
    shared/        cross-page widgets (status badge, crawls table, result drawer, empty state, pagination)
  pages/           one file per route
  hooks/           usePolledResource — polling fetch hook used across live views
  store/           zustand stores (auth session, persisted crawl-form defaults)
  lib/
    types.ts       CrawlSettings etc. — mirrors onecrawler's Python Settings shape
    api.ts         apiFetch — the shared authenticated fetch wrapper
    crawls-api.ts  crawl/data/discovered-URL/log endpoints
    api-mapper.ts  converts UI state to the backend's snake_case payload
  providers/       theme provider (light/dark/system)
```

## Backend contract

`src/lib/api-mapper.ts` shapes crawl settings into the snake_case payload matching onecrawler's `Settings` kwargs (`link_extraction_limit`, `proxy_rotation_method`, `scraping_output_format`, etc.) — that's the contract `onecrawler-backend` accepts. `src/lib/crawls-api.ts` is the full list of REST endpoints this UI calls (crawls, discovered URLs, logs, extracted data, cancel/retry/delete).
