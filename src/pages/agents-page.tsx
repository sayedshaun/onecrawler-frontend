import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, History, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";

import { ChatComposer } from "@/components/agents/chat-composer";
import { ChatMessage } from "@/components/agents/chat-message";
import { ConversationHistory } from "@/components/agents/conversation-history";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { usePolledResource } from "@/hooks/use-polled-resource";
import {
  AgentStreamError,
  getAgentConversation,
  getAgentSettings,
  listAgentConversations,
  streamAgentChat,
} from "@/lib/agents-api";
import { ApiError } from "@/lib/api";
import { generateId } from "@/lib/utils";
import type { AgentConversationSummary, AgentMessage, AgentTraceStep } from "@/lib/types";

// Appends a token delta to the message's trailing text part, or starts a new
// one if the last part is a trace step (a tool call/result landed since the
// previous token) — keeps streamed text and steps in the order they actually
// happened rather than in two separate buckets.
function appendToken(message: AgentMessage, content: string): AgentMessage {
  const parts = message.parts.slice();
  const last = parts[parts.length - 1];
  if (last?.kind === "text") {
    parts[parts.length - 1] = { ...last, text: last.text + content };
  } else {
    parts.push({ kind: "text", id: generateId(), text: content });
  }
  return { ...message, parts, pending: false };
}

function appendStep(message: AgentMessage, step: AgentTraceStep): AgentMessage {
  return { ...message, parts: [...message.parts, { kind: "step", id: step.id, step }], pending: false };
}

const SUGGESTIONS = [
  "Crawl example.com and extract every blog post title and publish date",
  "Start a sitemap crawl of docs.example.com limited to 200 URLs",
  "What's the status of my most recent crawl?",
];

export default function AgentsPage() {
  const [conversations, setConversations] = useState<AgentConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const { data: settings } = usePolledResource(getAgentSettings, { cacheKey: "agents:settings" });
  const isConfigured = settings?.llm.hasKey ?? false;

  // Seeds the conversation list from the backend on first mount. Its history
  // only tracks conversations that have received at least one message — a
  // brand-new session starts on an unsaved, client-only id that becomes real
  // the moment the first message is sent.
  useEffect(() => {
    listAgentConversations()
      .then((list) => {
        setConversations(list);
        const id = list[0]?.id ?? generateId();
        setActiveId(id);
        activeIdRef.current = id;
        if (list[0]) loadConversation(list[0].id);
      })
      .catch(() => {
        const id = generateId();
        setActiveId(id);
        activeIdRef.current = id;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  function loadConversation(id: string) {
    setLoadingConversation(true);
    getAgentConversation(id)
      .then(({ messages: loaded }) => {
        if (activeIdRef.current !== id) return;
        setMessages(loaded);
      })
      .catch((err) => {
        if (activeIdRef.current !== id) return;
        toast.error("Couldn't load that conversation", {
          description: err instanceof ApiError ? err.message : "Lost connection to the agent.",
        });
      })
      .finally(() => {
        if (activeIdRef.current === id) setLoadingConversation(false);
      });
  }

  function selectConversation(id: string) {
    if (id === activeId) return;
    abortRef.current?.abort();
    setIsStreaming(false);
    setActiveId(id);
    activeIdRef.current = id;
    setMessages([]);
    setHistoryOpen(false);
    loadConversation(id);
  }

  function handleNewChat() {
    abortRef.current?.abort();
    setIsStreaming(false);
    const id = generateId();
    setActiveId(id);
    activeIdRef.current = id;
    setMessages([]);
    setLoadingConversation(false);
    setHistoryOpen(false);
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming || !activeId) return;
    if (!isConfigured) {
      toast.error("Configure the agent first", {
        description: "Add an LLM provider and API key under Settings › Agent Config.",
      });
      return;
    }
    const conversationId = activeId;

    const userMessage: AgentMessage = {
      id: generateId(),
      role: "user",
      parts: [{ kind: "text", id: generateId(), text: trimmed }],
      createdAt: Date.now(),
    };
    const assistantId = generateId();
    const assistantMessage: AgentMessage = {
      id: assistantId,
      role: "assistant",
      parts: [],
      createdAt: Date.now(),
      pending: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    function updateAssistant(transform: (m: AgentMessage) => AgentMessage) {
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? transform(m) : m)));
    }

    streamAgentChat({
      conversationId,
      message: trimmed,
      signal: controller.signal,
      onEvent: (event) => {
        if (event.type === "token") {
          updateAssistant((m) => appendToken(m, event.content));
        } else if (event.type === "step") {
          updateAssistant((m) => appendStep(m, event.step));
        } else if (event.type === "error") {
          updateAssistant((m) => ({ ...m, error: event.message, pending: false }));
        }
      },
    })
      .catch((err) => {
        if (controller.signal.aborted) return;
        const message = err instanceof AgentStreamError ? err.message : "Lost connection to the agent.";
        updateAssistant((m) => ({ ...m, error: message, pending: false }));
        toast.error("Agent request failed", { description: message });
      })
      .finally(() => {
        setIsStreaming(false);
        abortRef.current = null;
        // The backend creates/renames the conversation server-side as part of
        // handling the turn — refresh the list so a brand-new chat appears
        // (and an existing one's title/recency updates) once it's done.
        listAgentConversations()
          .then(setConversations)
          .catch(() => {});
      });
  }

  function handleStop() {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((m, i) => (i === prev.length - 1 && m.role === "assistant" ? { ...m, pending: false } : m)),
    );
  }

  return (
    <div className="flex h-[calc(100dvh-9rem)] min-h-[28rem] gap-4">
      <aside className="hidden w-64 shrink-0 rounded-xl border border-border bg-card/40 p-3 md:block">
        <ConversationHistory conversations={conversations} activeId={activeId} onSelect={selectConversation} onNew={handleNewChat} />
      </aside>

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="left" className="w-3/4 max-w-xs p-4">
          <SheetTitle className="sr-only">Chat history</SheetTitle>
          <ConversationHistory
            conversations={conversations}
            activeId={activeId}
            onSelect={selectConversation}
            onNew={handleNewChat}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-start gap-2">
          <Button
            variant="outline"
            size="icon"
            className="mt-0.5 shrink-0 md:hidden"
            onClick={() => setHistoryOpen(true)}
            aria-label="Open chat history"
          >
            <History className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Agent</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Describe what you want crawled — the agent can configure and run crawls for you.
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card/40">
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-4 p-4">
              {loadingConversation ? (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading conversation…
                </div>
              ) : messages.length === 0 ? (
                !isConfigured ? (
                  <EmptyState
                    icon={Bot}
                    title="Configure the agent to get started"
                    description="It needs its own LLM provider and API key before it can plan and run crawls for you."
                    action={
                      <Button size="sm" asChild>
                        <Link to="/dashboard/settings">
                          <Settings className="h-3.5 w-3.5" />
                          Configure agent
                        </Link>
                      </Button>
                    }
                  />
                ) : (
                  <EmptyState
                    icon={Bot}
                    title="Ask the agent to run a crawl"
                    description="Describe a target site and what to extract, in plain language."
                    action={
                      <div className="flex flex-col gap-2 pt-2">
                        {SUGGESTIONS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => send(s)}
                            className="rounded-lg border border-border bg-background/50 px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors duration-150 ease-out hover:bg-accent hover:text-accent-foreground"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    }
                  />
                )
              ) : (
                messages.map((m) => <ChatMessage key={m.id} message={m} />)
              )}
              <div ref={scrollAnchorRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-border p-3">
            <ChatComposer
              value={input}
              onChange={setInput}
              onSubmit={() => send(input)}
              onStop={handleStop}
              isStreaming={isStreaming}
              disabled={!isConfigured}
              placeholder={isConfigured ? undefined : "Configure the agent in Settings to start chatting"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
