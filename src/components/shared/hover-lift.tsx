import type { ReactNode } from "react";

/** Passthrough wrapper kept for the shared card/row API. The previous version
 * translated its child up a couple of pixels on hover; that movement felt
 * fidgety on the dashboard, so hover feedback now comes purely from the cards'
 * own `hover:shadow-md` shadow transition — no positional shift. */
export function HoverLift({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
