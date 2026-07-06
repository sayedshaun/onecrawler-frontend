import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function JsonPreview({ value, className }: { value: unknown; className?: string }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(value, null, 2);

  async function copy() {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 h-7 gap-1.5 text-xs text-muted-foreground"
        onClick={copy}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      <ScrollArea className="h-72 rounded-lg border border-border bg-muted/40">
        <pre className="p-4 font-mono text-[11px] leading-relaxed text-foreground/90">{json}</pre>
      </ScrollArea>
    </div>
  );
}
