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
  "/dashboard/templates": "Templates",
  "/dashboard/tutorial": "Tutorial",
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/60 px-4 backdrop-blur-xl backdrop-saturate-150 lg:px-6">
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
        {/* w-3/4 (not a fixed px width) so the drawer stays proportional on very
            narrow phones instead of eating almost the whole screen; max-w-xs
            caps it once the 3/4 share would otherwise get too wide. */}
        <SheetContent side="left" className="w-3/4 max-w-xs p-0">
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
