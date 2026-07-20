import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronRight, ListChecks, Terminal } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AgentTraceStep } from "@/lib/types";

function humanizeToolName(name: string): string {
  return name.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function describeStep(step: AgentTraceStep): string {
  if (step.isPlanning) return step.kind === "call" ? "Planning" : "Plan updated";
  const name = humanizeToolName(step.toolName);
  return step.kind === "call" ? `Calling ${name}…` : `${name} result`;
}

export function AgentTraceStepView({ step }: { step: AgentTraceStep }) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = !!step.detail;

  const Icon = step.isPlanning ? ListChecks : step.kind === "call" ? Terminal : CheckCircle2;
  const colorClass = step.isPlanning
    ? "bg-violet-500/15 text-violet-600 dark:text-violet-400"
    : step.kind === "call"
      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
      : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
  const borderClass = step.isPlanning
    ? "border-violet-500/25 bg-violet-500/5"
    : step.kind === "call"
      ? "border-amber-500/25 bg-amber-500/5"
      : "border-emerald-500/25 bg-emerald-500/5";

  return (
    <div className={cn("rounded-lg border px-3 py-2 text-xs", borderClass)}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canExpand}
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left disabled:cursor-default"
        >
          <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", colorClass)}>
            <Icon className="h-3 w-3" />
          </span>
          <span className="font-medium text-foreground">{describeStep(step)}</span>
          {canExpand &&
            (expanded ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ))}
        </button>

        {step.jobId && (
          <Link
            to={`/dashboard/crawls/${step.jobId}`}
            className="inline-flex shrink-0 items-center gap-0.5 text-primary transition-opacity duration-150 hover:opacity-80"
          >
            View crawl
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {expanded && step.detail && (
        <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-background/60 p-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
          {step.detail}
        </pre>
      )}
    </div>
  );
}
