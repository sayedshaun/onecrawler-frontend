import { useState } from "react";
import { Eye, FileSearch } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ResultDetailDrawer } from "@/components/shared/result-detail-drawer";
import { truncate } from "@/lib/utils";
import type { CrawlResultItem } from "@/lib/types";

export function ResultsTable({ results }: { results: CrawlResultItem[] }) {
  const [selected, setSelected] = useState<CrawlResultItem | null>(null);

  if (results.length === 0) {
    return (
      <EmptyState
        icon={FileSearch}
        title="No results yet"
        description="Extracted pages will show up here once scraping begins."
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Format</TableHead>
            <TableHead className="text-right">Words</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.id}>
              <TableCell>
                <p className="font-medium text-foreground">{truncate(result.title, 60)}</p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{result.url}</p>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="uppercase">
                  {result.format}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {result.wordCount.toLocaleString()}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(result)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ResultDetailDrawer result={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </>
  );
}
