import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import type { LogLine } from "@/lib/types";

const LEVEL_CLASS: Record<LogLine["level"], string> = {
  info: "text-foreground/80",
  debug: "text-muted-foreground",
  warn: "text-warning",
  error: "text-destructive",
};

function timestamp(t: number): string {
  return new Date(t).toLocaleTimeString([], { hour12: false });
}

export function LiveLogConsole({ logs }: { logs: LogLine[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [logs.length]);

  return (
    <div
      ref={ref}
      className="scrollbar-thin h-80 overflow-y-auto rounded-lg border border-border bg-[hsl(231_15%_12%)] p-3 font-mono text-xs leading-relaxed"
    >
      {logs.length === 0 && <p className="text-muted-foreground">No log output yet.</p>}
      {logs.map((log) => (
        <div key={log.id} className="flex gap-2">
          <span className="shrink-0 text-muted-foreground/60">{timestamp(log.timestamp)}</span>
          <span
            className={cn(
              "shrink-0 uppercase",
              log.level === "error" && "text-destructive",
              log.level === "warn" && "text-warning",
              log.level === "info" && "text-primary",
              log.level === "debug" && "text-muted-foreground",
            )}
          >
            [{log.level}]
          </span>
          <span className={cn("break-all", LEVEL_CLASS[log.level])}>{log.message}</span>
        </div>
      ))}
    </div>
  );
}
