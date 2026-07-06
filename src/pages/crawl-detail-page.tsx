import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, SearchX, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { JsonPreview } from "@/components/shared/json-preview";
import { Pagination } from "@/components/shared/pagination";
import { ProgressPanel } from "@/components/crawl-detail/progress-panel";
import { ResultsTable } from "@/components/crawl-detail/results-table";
import { DiscoveredUrlsList } from "@/components/crawl-detail/discovered-urls-list";
import { LiveLogConsole } from "@/components/crawl-detail/live-log-console";
import { usePolledResource } from "@/hooks/use-polled-resource";
import { ApiError } from "@/lib/api";
import {
  cancelCrawl,
  createCrawlFromPayload,
  deleteCrawl,
  getCrawl,
  listCrawlLogs,
  listData,
  listDiscoveredUrls,
} from "@/lib/crawls-api";
import type { CrawlDetail } from "@/lib/types";

const ACTIVE_STATUSES = new Set(["queued", "running"]);
const PAGE_SIZE = 20;

function ResultsTabPanel({ jobId }: { jobId: string }) {
  const [page, setPage] = useState(0);
  const { data, error } = usePolledResource(
    () => listData({ jobId, limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
    { deps: [jobId, page] },
  );
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <ResultsTable results={items} />
      {total > 0 && <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />}
    </div>
  );
}

function DiscoveredTabPanel({ jobId }: { jobId: string }) {
  const [page, setPage] = useState(0);
  const { data, error } = usePolledResource(
    () => listDiscoveredUrls(jobId, { limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
    { deps: [jobId, page] },
  );
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <DiscoveredUrlsList urls={items} />
      {total > 0 && <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />}
    </div>
  );
}

function LogsTabPanel({ jobId }: { jobId: string }) {
  const [page, setPage] = useState(0);
  const { data, error } = usePolledResource(
    () => listCrawlLogs(jobId, { limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
    { deps: [jobId, page] },
  );
  // Backend returns newest-first for pagination; reverse so each page still
  // reads top-to-bottom chronologically, like a normal log console.
  const items = [...(data?.items ?? [])].reverse();
  const total = data?.total ?? 0;

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <LiveLogConsole logs={items} />
      {total > 0 && <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />}
    </div>
  );
}

export default function CrawlDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<CrawlDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = useCallback(async () => {
    if (!jobId) return;
    try {
      const detail = await getCrawl(jobId);
      setJob(detail);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Failed to load crawl.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    setLoading(true);
    setJob(null);
    load();
  }, [load]);

  useEffect(() => {
    if (!job || !ACTIVE_STATUSES.has(job.status)) return;
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [job, load]);

  async function handleCancel() {
    if (!job) return;
    setActionError(null);
    try {
      await cancelCrawl(job.id);
      await load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to cancel crawl.");
    }
  }

  async function handleDelete() {
    if (!job) return;
    setDeleting(true);
    setActionError(null);
    try {
      await deleteCrawl(job.id);
      navigate("/dashboard/crawls", { replace: true });
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to delete crawl.");
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  async function handleRetry() {
    if (!job) return;
    setActionError(null);
    setRetrying(true);
    try {
      const next = await createCrawlFromPayload({
        target_url: job.targetUrl,
        mode: job.mode,
        settings: job.settings,
      });
      navigate(`/dashboard/crawls/${next.id}`);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to start a new crawl.");
      setRetrying(false);
    }
  }

  if (loading && !job) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading crawl…
      </div>
    );
  }

  if (!job) {
    return (
      <EmptyState
        icon={SearchX}
        title="Crawl not found"
        description={loadError ?? "This crawl may have been removed, or the link is incorrect."}
        action={
          <Button asChild size="sm">
            <Link to="/dashboard/crawls">Back to history</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/dashboard/crawls" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to history
        </Link>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={ACTIVE_STATUSES.has(job.status)}
              title={ACTIVE_STATUSES.has(job.status) ? "Cancel the crawl before deleting it" : undefined}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete this crawl?</DialogTitle>
              <DialogDescription>
                This permanently removes <span className="break-all font-medium text-foreground">{job.targetUrl}</span> along
                with all of its discovered URLs, results, and logs. This can't be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete crawl
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {actionError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{actionError}</p>
      )}

      <ProgressPanel job={job} onCancel={handleCancel} onRetry={handleRetry} />
      {retrying && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Starting new crawl…
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="results">
            <TabsList className="mb-4 flex-wrap">
              <TabsTrigger value="results">Results ({job.urlsScraped})</TabsTrigger>
              <TabsTrigger value="discovered">Discovered URLs ({job.urlsDiscovered})</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="settings">Settings Used</TabsTrigger>
            </TabsList>

            <TabsContent value="results">
              <ResultsTabPanel jobId={job.id} />
            </TabsContent>
            <TabsContent value="discovered">
              <DiscoveredTabPanel jobId={job.id} />
            </TabsContent>
            <TabsContent value="logs">
              <LogsTabPanel jobId={job.id} />
            </TabsContent>
            <TabsContent value="settings">
              <JsonPreview value={job.settings} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
