import { lazy, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronsUpDown, LogOut, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth-store";

// Lazy: SettingsMenu itself is always mounted (top bar + sidebar, on every
// page), but its account/usage/API-key card content is a real chunk of code —
// deferring it until the dialog is actually opened keeps that weight out of
// the app's initial bundle, the same way each route is already lazy-loaded.
const SettingsDialog = lazy(() =>
  import("@/components/settings/settings-dialog").then((m) => ({ default: m.SettingsDialog })),
);

interface SettingsMenuProps {
  /** "icon" — bare gear button (top bar, mobile). "row" — full-width
   * avatar + name row anchored to the bottom of the Sidebar, like
   * ChatGPT/Claude's account entry. */
  variant?: "icon" | "row";
}

/** The single settings entry point — user identity, the Settings dialog
 * (which now owns the theme switcher, under Appearance), and logout, all
 * under one trigger instead of scattered avatar/theme-toggle/logout controls. */
export function SettingsMenu({ variant = "icon" }: SettingsMenuProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "row" ? (
          <button
            type="button"
            aria-label="Account menu"
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors duration-150 ease-out hover:bg-accent"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{user?.name || user?.email || "Account"}</p>
              {user?.name && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Settings"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align={variant === "row" ? "start" : "end"} side={variant === "row" ? "top" : "bottom"} className="w-56">
        {variant === "icon" && (
          <>
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user?.name || user?.email}</p>
                {user?.name && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
              </div>
            </div>

            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>

      {settingsOpen && (
        <Suspense fallback={null}>
          <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        </Suspense>
      )}
    </DropdownMenu>
  );
}
