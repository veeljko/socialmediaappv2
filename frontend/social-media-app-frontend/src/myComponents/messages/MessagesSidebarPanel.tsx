import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Conversation } from "@/features/message/types";
import { ConversationListItem } from "./ConversationListItem";

interface MessagesSidebarPanelProps {
  authedUsername?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
}

export function MessagesSidebarPanel({
  authedUsername,
  searchValue,
  onSearchChange,
  conversations,
  activeConversationId,
  onSelectConversation,
}: MessagesSidebarPanelProps) {
  return (
    <section className="flex min-h-0 flex-col border-b border-border/70 bg-background/80 lg:border-b-0 lg:border-r">
      <div className="border-b border-border/70 px-5 pb-4 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xl font-extralight text-muted-foreground tracking-tight">
              {authedUsername ? `@${authedUsername}` : "Messages"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Direct messages
            </p>
          </div>
          
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-3 py-2.5 shadow-inner">
          <Search size={16} className="text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search messages"
            className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Messages</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onSelect={() => onSelectConversation(conversation.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
