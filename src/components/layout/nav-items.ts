import type { LucideIcon } from "lucide-react";
import { Bot, Database, GraduationCap, History, Layers, LayoutDashboard } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/agents", label: "Agent", icon: Bot },
  { to: "/dashboard/crawls", label: "Crawl History", icon: History },
  { to: "/dashboard/data", label: "Extracted Data", icon: Database },
  { to: "/dashboard/templates", label: "Templates", icon: Layers },
  { to: "/dashboard/tutorial", label: "Tutorial", icon: GraduationCap },
];
