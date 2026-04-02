import { Info, Phone } from "lucide-react";
import { UserAvatar } from "@/myComponents/Profile/UserAvatar";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/features/message/types";
import { getConversationUser } from "@/features/message/utils";

interface MessagesChatHeaderProps {
  conversation: Conversation;
}

export function MessagesChatHeader({ conversation }: MessagesChatHeaderProps) {
  const conversationUser = getConversationUser(conversation);

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-background/90 px-5 py-4 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <div className={cn("rounded-full bg-gradient-to-br p-[2px]", conversation.accent)}>
          <div className="relative rounded-full bg-background p-[2px]">
            <UserAvatar profileData={conversationUser} size="xl" />
            {conversation.isOnline ? (
              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500" />
            ) : null}
          </div>
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold tracking-tight">
            {conversation.fullName}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            @{conversation.username}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {[Phone, Info].map((Icon, index) => (
          <button
            key={`${conversation.id}-${index}`}
            type="button"
            className="rounded-full border border-border bg-background p-2.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}
