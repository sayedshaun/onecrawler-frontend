import { Link } from "react-router-dom";
import { ArrowUpRight, Globe, Map, Waypoints } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatNumber, formatRelativeTime, truncate } from "@/lib/utils";
import type { CrawlMode, CrawlSummary } from "@/lib/types";

const MODE_META: Record<CrawlMode, { label: string; icon: typeof Globe }> = {
  sitemap: { label: "Sitemap", icon: Map },
  link_extraction: { label: "Link Extraction", icon: Waypoints },
  crawler: { label: "Crawler", icon: Globe },
};

export function CrawlsTable({ jobs }: { jobs: CrawlSummary[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Target</TableHead>
          <TableHead>Mode</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Scraped</TableHead>
          <TableHead className="text-right">Failed</TableHead>
          <TableHead>Started</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => {
          const Mode = MODE_META[job.mode];
          return (
            <TableRow key={job.id}>
              <TableCell>
                <Link
                  to={`/dashboard/crawls/${job.id}`}
                  className="font-medium text-foreground hover:text-primary hover:underline underline-offset-2"
                >
                  {truncate(job.targetUrl.replace(/^https?:\/\//, ""), 42)}
                </Link>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mode.icon className="h-3.5 w-3.5" />
                  {Mode.label}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={job.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(job.urlsScraped)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {job.urlsFailed > 0 ? formatNumber(job.urlsFailed) : "—"}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {job.startedAt ? formatRelativeTime(new Date(job.startedAt)) : "—"}
              </TableCell>
              <TableCell>
                <Link
                  to={`/dashboard/crawls/${job.id}`}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
