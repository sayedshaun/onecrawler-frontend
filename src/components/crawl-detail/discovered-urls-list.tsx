import { CheckCircle2, CircleDashed, FilterX, XCircle } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import type { DiscoveredUrl } from "@/lib/types";

const STATUS_ICON: Record<DiscoveredUrl["status"], typeof CheckCircle2> = {
  pending: CircleDashed,
  extracted: CheckCircle2,
  filtered: FilterX,
  failed: XCircle,
};

const STATUS_CLASS: Record<DiscoveredUrl["status"], string> = {
  pending: "text-muted-foreground",
  extracted: "text-success",
  filtered: "text-warning",
  failed: "text-destructive",
};

export function DiscoveredUrlsList({ urls }: { urls: DiscoveredUrl[] }) {
  if (urls.length === 0) {
    return (
      <EmptyState
        icon={CircleDashed}
        title="No URLs discovered yet"
        description="Discovered links will appear here as the crawl progresses."
      />
    );
  }

  const ordered = [...urls].reverse();

  return (
    <div className="scrollbar-thin max-h-96 space-y-1 overflow-y-auto">
      {ordered.map((item) => {
        const Icon = STATUS_ICON[item.status];
        return (
          <div
            key={item.id}
            className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs hover:bg-accent/50"
          >
            <Icon className={cn("h-3.5 w-3.5 shrink-0", STATUS_CLASS[item.status], item.status === "pending" && "animate-pulse")} />
            <span className="truncate font-mono text-foreground/80">{item.url}</span>
          </div>
        );
      })}
    </div>
  );
}
