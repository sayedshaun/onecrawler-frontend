import { Bot, TriangleAlert, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { AgentTraceStepView } from "@/components/agents/agent-trace-step";
import { cn } from "@/lib/utils";
import type { AgentMessage } from "@/lib/types";

function ThinkingIndicator() {
  return (
    <div className="glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-muted-foreground">
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
      </span>
      Thinking…
    </div>
  );
}

export function ChatMessage({ message }: { message: AgentMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>

      <div className={cn("flex max-w-[85%] flex-col gap-2 sm:max-w-[75%]", isUser && "items-end")}>
        {message.pending && message.parts.length === 0 && <ThinkingIndicator />}

        {message.parts.map((part) =>
          part.kind === "step" ? (
            <AgentTraceStepView key={part.id} step={part.step} />
          ) : (
            <div
              key={part.id}
              className={cn("rounded-xl px-4 py-2.5 text-sm", isUser ? "bg-primary text-primary-foreground" : "glass")}
            >
              {isUser ? (
                <p className="whitespace-pre-wrap">{part.text}</p>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
                </div>
              )}
            </div>
          ),
        )}

        {message.error && (
          <div className="flex items-center gap-1.5 text-xs text-destructive">
            <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
            {message.error}
          </div>
        )}
      </div>
    </div>
  );
}
