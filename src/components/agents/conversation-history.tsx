import { MessageSquarePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { AgentConversationSummary } from "@/lib/types";

interface ConversationHistoryProps {
  conversations: AgentConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

// No delete action here — onecrawler-agents-backend only exposes GET /chats
// and GET /chats/{id}, with no endpoint to remove a conversation.
export function ConversationHistory({ conversations, activeId, onSelect, onNew }: ConversationHistoryProps) {
  return (
    <div className="flex h-full flex-col gap-2">
      <Button variant="outline" size="sm" className="justify-start gap-2" onClick={onNew}>
        <MessageSquarePlus className="h-4 w-4" />
        New chat
      </Button>

      <ScrollArea className="-mx-1 flex-1 px-1">
        <div className="flex flex-col gap-0.5">
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                "truncate rounded-lg px-2.5 py-2 text-left text-sm transition-colors duration-150 ease-out hover:bg-accent",
                c.id === activeId ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              {c.title}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
