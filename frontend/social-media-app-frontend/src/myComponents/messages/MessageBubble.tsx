import { cn } from "@/lib/utils";
import type { MessageItem } from "@/features/message/types";

interface MessageBubbleProps {
  message: MessageItem;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMine = message.author === "me";

  return (
    <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[72%] rounded-[1.6rem] px-4 py-3 text-sm shadow-sm",
          isMine
            ? "rounded-br-md bg-sky-500 text-white"
            : "rounded-bl-md border border-border bg-background text-foreground"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <div
          className={cn(
            "mt-1.5 flex items-center gap-2 text-[11px]",
            isMine ? "text-white/75" : "text-muted-foreground"
          )}
        >
          
        </div>
      </div>
    </div>
  );
}
