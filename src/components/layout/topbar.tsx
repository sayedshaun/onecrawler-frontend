import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SidebarContent } from "@/components/layout/sidebar";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/crawls": "Crawl History",
  "/dashboard/crawls/new": "New Crawl",
  "/dashboard/data": "Extracted Data",
  "/dashboard/settings": "Settings",
};

function pageTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/dashboard/crawls/")) return "Crawl Detail";
  return "OneCrawler";
}

export function TopBar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = useMemo(() => pageTitle(location.pathname), [location.pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div onClick={() => setMobileOpen(false)} className="h-full">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      <h1 className="text-sm font-semibold text-foreground">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
