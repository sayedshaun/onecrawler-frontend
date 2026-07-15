import { useState } from "react";
import { Check, Copy } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-light";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import { vs, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/providers/theme-provider";
import { cn, copyToClipboard, stringifyJsonForDisplay } from "@/lib/utils";

SyntaxHighlighter.registerLanguage("json", json);

// VS Code's own editor background colors — a code panel is a deliberate exception
// to the app's translucent glass surfaces, same as VS Code's editor pane reads as
// a solid rectangle distinct from the OS chrome around it.
const DARK_BG = "#1e1e1e";
const LIGHT_BG = "#ffffff";

/** Pretty-printed, syntax-highlighted raw JSON — reads like a clean API-docs code
 * block (VS Code's Dark+/Light+ token colors, no line-number gutter) rather than
 * an app-styled tree inspector. */
export function JsonCodeViewer({ data, className }: { data: unknown; className?: string }) {
  const { resolvedTheme } = useTheme();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const text = stringifyJsonForDisplay(data);
  const bg = resolvedTheme === "dark" ? DARK_BG : LIGHT_BG;

  async function copy() {
    const ok = await copyToClipboard(text);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => setCopyState("idle"), 1500);
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border", className)} style={{ backgroundColor: bg }}>
      <div
        className="flex items-center justify-between border-b px-3 py-1.5"
        style={{ borderColor: resolvedTheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}
      >
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">JSON</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-6 gap-1.5 text-xs", copyState === "failed" ? "text-destructive" : "text-muted-foreground")}
          onClick={copy}
        >
          {copyState === "copied" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy"}
        </Button>
      </div>
      <ScrollArea className="h-[40vh]" style={{ backgroundColor: bg }}>
        <SyntaxHighlighter
          language="json"
          style={resolvedTheme === "dark" ? vscDarkPlus : vs}
          wrapLongLines
          customStyle={{
            background: bg,
            margin: 0,
            padding: "1rem",
            fontSize: "13px",
            lineHeight: 1.6,
            fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
            overflowX: "hidden",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
          codeTagProps={{ style: { fontFamily: "inherit" } }}
        >
          {text}
        </SyntaxHighlighter>
      </ScrollArea>
    </div>
  );
}
