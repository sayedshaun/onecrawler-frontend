import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  History,
  Database,
  Layers,
  Settings,
  SquarePlus,
  Radar,
  LogOut,
} from "lucide-react";

import { LiveDot } from "@/components/shared/live-dot";
import { usePolledResource } from "@/hooks/use-polled-resource";
import { getDashboardOverview } from "@/lib/crawls-api";
import { springUI } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/crawls", label: "Crawl History", icon: History },
  { to: "/dashboard/data", label: "Extracted Data", icon: Database },
  { to: "/dashboard/templates", label: "Templates", icon: Layers },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function SidebarContent() {
  const { data: overview } = usePolledResource(getDashboardOverview, { intervalMs: 5000 });
  const runningCount = overview?.jobCounts.running ?? 0;
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-full flex-col bg-sidebar/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="flex h-14 items-center gap-2 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Radar className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
          OneCrawler
        </span>
      </div>

      <div className="px-3 pb-3">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={springUI}>
          <NavLink
            to="/dashboard/crawls/new"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-150 ease-out hover:bg-primary/90"
          >
            <SquarePlus className="h-4 w-4" />
            New Crawl
          </NavLink>
        </motion.div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors duration-150 ease-out hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                isActive && "bg-sidebar-accent text-sidebar-foreground",
              )
            }
          >
            <span className="flex items-center gap-2.5">
              <Icon className="h-4 w-4" />
              {label}
            </span>
            {label === "Crawl History" && runningCount > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                <LiveDot className="bg-success" />
                {runningCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-sidebar-foreground">
              {user?.name || user?.email}
            </p>
            {user?.name && (
              <p className="truncate text-[11px] text-sidebar-foreground/50">{user.email}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors duration-150 ease-out hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-sidebar-border/60">
      <SidebarContent />
    </aside>
  );
}
