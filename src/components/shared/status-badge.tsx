import { Ban, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CrawlStatus } from "@/lib/types";

const CONFIG: Record<
  CrawlStatus,
  { label: string; variant: "default" | "success" | "destructive" | "warning" | "secondary"; icon: typeof Clock }
> = {
  queued: { label: "Queued", variant: "secondary", icon: Clock },
  running: { label: "Running", variant: "default", icon: Loader2 },
  completed: { label: "Completed", variant: "success", icon: CheckCircle2 },
  failed: { label: "Failed", variant: "destructive", icon: XCircle },
  cancelled: { label: "Cancelled", variant: "warning", icon: Ban },
};

export function StatusBadge({ status }: { status: CrawlStatus }) {
  const { label, variant, icon: Icon } = CONFIG[status];
  return (
    <Badge variant={variant}>
      <Icon className={cn("h-3 w-3", status === "running" && "animate-spin")} />
      {label}
    </Badge>
  );
}
