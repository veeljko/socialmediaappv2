import { UserAvatar } from "@/myComponents/Profile/UserAvatar";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/features/message/types";
import { formatLastActive, getConversationUser } from "@/features/message/utils";

interface ConversationListItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
}

export function ConversationListItem({
  conversation,
  isActive,
  onSelect,
}: ConversationListItemProps) {
  const conversationUser = getConversationUser(conversation);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-[1.3rem] px-3 py-3 text-left transition-all duration-200",
        isActive
          ? "bg-accent text-foreground shadow-sm"
          : "hover:bg-accent/55"
      )}
    >
      <div className={cn("rounded-full bg-gradient-to-br p-[2px]", conversation.accent)}>
        <div className="relative rounded-full bg-background p-[2px]">
          <UserAvatar profileData={conversationUser} size="xl" />
          {conversation.isOnline ? (
            <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500" />
          ) : null}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-medium">{conversation.fullName}</p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatLastActive(conversation.activeMinutesAgo)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <p className="truncate text-sm text-muted-foreground">
            {conversation.preview}
          </p>
          {conversation.unreadCount ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-500 px-1.5 text-[11px] font-semibold text-white">
              {conversation.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
