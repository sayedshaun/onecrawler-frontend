import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  History,
  Database,
  Layers,
  GraduationCap,
  Radar,
} from "lucide-react";

import { SettingsMenu } from "@/components/layout/settings-menu";
import { LiveDot } from "@/components/shared/live-dot";
import { usePolledResource } from "@/hooks/use-polled-resource";
import { getDashboardOverview } from "@/lib/crawls-api";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/agents", label: "Agent", icon: Bot },
  { to: "/dashboard/crawls", label: "Crawl History", icon: History },
  { to: "/dashboard/data", label: "Extracted Data", icon: Database },
  { to: "/dashboard/templates", label: "Templates", icon: Layers },
  { to: "/dashboard/tutorial", label: "Tutorial", icon: GraduationCap },
];

export function TopBar() {
  // Shares dashboard-page's own overview poll via the same cacheKey (instant
  // hydration from whichever fetched last) but on its own, slower interval —
  // the running-count badge doesn't need to be as fresh as the dashboard's charts.
  const { data: overview } = usePolledResource(getDashboardOverview, {
    intervalMs: 20000,
    cacheKey: "dashboard:overview",
  });
  const runningCount = overview?.jobCounts.running ?? 0;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-background/60 px-3 backdrop-blur-xl backdrop-saturate-150 sm:gap-3 sm:px-4 lg:px-6">
      <NavLink to="/dashboard" className="flex shrink-0 items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Radar className="h-4 w-4" />
        </div>
        <span className="hidden text-sm font-semibold tracking-tight text-foreground md:inline">
          OneCrawler
        </span>
      </NavLink>

      {/* Centered within the space between the logo and the right-side actions —
          on narrow screens this fills that space and scrolls horizontally
          instead, since there isn't room to lay all links out at once. */}
      <nav className="scrollbar-thin flex min-w-0 flex-1 items-center justify-start gap-1 overflow-x-auto overflow-y-hidden sm:justify-center">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-out hover:bg-accent hover:text-accent-foreground sm:px-3",
                isActive && "bg-accent text-accent-foreground",
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            {label === "Crawl History" && runningCount > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                <LiveDot className="bg-success" />
                {runningCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <SettingsMenu />
      </div>
    </header>
  );
}
