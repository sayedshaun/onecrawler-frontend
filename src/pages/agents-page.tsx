import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, FileSearch, History, ListChecks, Map, Settings } from "lucide-react";
import { toast } from "sonner";

import { ChatComposer } from "@/components/agents/chat-composer";
import { ChatMessage } from "@/components/agents/chat-message";
import { ConversationHistory } from "@/components/agents/conversation-history";
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
import { formatRelativeTime, generateId } from "@/lib/utils";
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

// A "result" step shares its id with the "call" step it resolves — update
// that chip in place (spinner -> checkmark) instead of appending a second,
// separate entry for the same tool invocation.
function appendStep(message: AgentMessage, step: AgentTraceStep): AgentMessage {
  const existingIndex = message.parts.findIndex((p) => p.kind === "step" && p.id === step.id);
  if (existingIndex !== -1) {
    const parts = message.parts.slice();
    parts[existingIndex] = { kind: "step", id: step.id, step };
    return { ...message, parts, pending: false };
  }
  return { ...message, parts: [...message.parts, { kind: "step", id: step.id, step }], pending: false };
}

const SUGGESTIONS = [
  { icon: FileSearch, text: "Crawl example.com and extract every blog post title and publish date" },
  { icon: Map, text: "Start a sitemap crawl of docs.example.com limited to 200 URLs" },
  { icon: ListChecks, text: "What's the status of my most recent crawl?" },
];

export default function AgentsPage() {
  const [conversations, setConversations] = useState<AgentConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  // Starts true so the first paint shows the loading spinner instead of a
  // flash of the empty-state greeting while the initial conversation list
  // fetch is still in flight.
  const [loadingConversation, setLoadingConversation] = useState(true);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  // Messages restored from history shouldn't replay their entrance animation
  // every time a conversation loads (or the tab is revisited) — only ones
  // actually streamed in live during this session should fade/slide in.
  const historicalIdsRef = useRef<Set<string>>(new Set());

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
        if (list[0]) {
          loadConversation(list[0].id);
        } else {
          setLoadingConversation(false);
        }
      })
      .catch(() => {
        const id = generateId();
        setActiveId(id);
        activeIdRef.current = id;
        setLoadingConversation(false);
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
        historicalIdsRef.current = new Set(loaded.map((m) => m.id));
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
    historicalIdsRef.current = new Set();
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
    historicalIdsRef.current = new Set();
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

  const hasMessages = messages.length > 0;
  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <div className="-mx-4 -my-6 flex h-[calc(100dvh-3.5rem)] lg:-mx-8 lg:-my-8">
      <aside className="hidden w-64 shrink-0 border-r border-border p-3 md:block">
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

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => setHistoryOpen(true)}
            aria-label="Open chat history"
          >
            <History className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground">
            {settings?.llm.model || "Agent"}
          </span>
          {hasMessages && activeConversation && (
            <span className="text-xs text-muted-foreground">
              · {formatRelativeTime(new Date(activeConversation.updatedAt))}
            </span>
          )}
        </div>

        {loadingConversation ? (
          <div className="flex-1" />
        ) : !hasMessages ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-6 w-6" />
            </div>
            {!isConfigured ? (
              <>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Configure the agent to get started</h2>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    It needs its own LLM provider and API key before it can plan and run crawls for you.
                  </p>
                </div>
                <Button size="sm" asChild>
                  <Link to="/dashboard/settings">
                    <Settings className="h-3.5 w-3.5" />
                    Configure agent
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-foreground">What are we crawling today?</h2>
                <div className="flex w-full max-w-2xl flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.text}
                      type="button"
                      onClick={() => send(s.text)}
                      className="flex items-center gap-2.5 rounded-2xl border border-border bg-background px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors duration-150 ease-out hover:bg-accent hover:text-accent-foreground"
                    >
                      <s.icon className="h-4 w-4 shrink-0 text-primary" />
                      {s.text}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} animate={!historicalIdsRef.current.has(m.id)} />
              ))}
              <div ref={scrollAnchorRef} />
            </div>
          </ScrollArea>
        )}

        <div className="mx-auto w-full max-w-2xl px-4 pb-4 pt-2">
          <ChatComposer
            value={input}
            onChange={setInput}
            onSubmit={() => send(input)}
            onStop={handleStop}
            isStreaming={isStreaming}
            disabled={!isConfigured}
            placeholder={isConfigured ? undefined : "Configure the agent in Settings to start chatting"}
            autoFocus={isConfigured && !isStreaming && !loadingConversation}
          />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            The agent can make mistakes — check crawl results before relying on them.
          </p>
        </div>
      </div>
    </div>
  );
}
