import { useEffect, useState } from "react";
import { Database, Download, Eye, Loader2, Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { ResultDetailDrawer } from "@/components/shared/result-detail-drawer";
import { usePolledResource } from "@/hooks/use-polled-resource";
import { downloadDataItem, listData } from "@/lib/crawls-api";
import { formatRelativeTime, truncate } from "@/lib/utils";
import type { DataItem, ScrapingOutputFormat } from "@/lib/types";

const PAGE_SIZE = 20;
const FORMATS: Array<{ value: ScrapingOutputFormat | "all"; label: string }> = [
  { value: "all", label: "All formats" },
  { value: "markdown", label: "Markdown" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "xmltei", label: "TEI XML" },
];

export default function DataPage() {
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<ScrapingOutputFormat | "all">("all");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<DataItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [query, format]);

  async function handleDownload(id: string) {
    setDownloadingId(id);
    try {
      await downloadDataItem(id);
    } catch {
      // Best-effort — the drawer's own content view remains the fallback.
    } finally {
      setDownloadingId(null);
    }
  }

  const { data, loading, error } = usePolledResource(
    () =>
      listData({
        q: query.trim() || undefined,
        format: format === "all" ? undefined : format,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    { deps: [query, format, page] },
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, URL, or content…"
                className="pl-9"
              />
            </div>
            <Select value={format} onValueChange={(v) => setFormat(v as ScrapingOutputFormat | "all")}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMATS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          {!loading && items.length === 0 ? (
            <EmptyState
              icon={Database}
              title="No extracted data"
              description="Results from completed crawls will show up here once pages have been scraped."
            />
          ) : (
            <>
              {/* Below sm: a 6-column table can't fit this much data without
                  cropping or blind horizontal scrolling — stack cards instead. */}
              <div className="space-y-2 sm:hidden">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelected(item)}
                    className="block w-full rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent/50"
                  >
                    <p className="truncate font-medium text-foreground">{truncate(item.title || "(untitled)", 40)}</p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{item.url}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="uppercase">
                        {item.format}
                      </Badge>
                      <span>{item.wordCount.toLocaleString()} words</span>
                      <span>{formatRelativeTime(new Date(item.extractedAt))}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden lg:table-cell">Source Crawl</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead className="text-right">Words</TableHead>
                      <TableHead className="hidden md:table-cell">Extracted</TableHead>
                      <TableHead className="w-20" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p className="font-medium text-foreground">{truncate(item.title || "(untitled)", 60)}</p>
                          <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{item.url}</p>
                        </TableCell>
                        <TableCell className="hidden max-w-48 truncate text-xs text-muted-foreground lg:table-cell">
                          {item.targetUrl}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="uppercase">
                            {item.format}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {item.wordCount.toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                          {formatRelativeTime(new Date(item.extractedAt))}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(item)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={downloadingId === item.id}
                              onClick={() => handleDownload(item.id)}
                            >
                              {downloadingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>

      <ResultDetailDrawer result={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
