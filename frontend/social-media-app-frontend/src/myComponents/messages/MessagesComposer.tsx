import { Heart, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessagesComposerProps {
  conversationId: string;
  draftMessage: string;
  onDraftMessageChange: (value: string) => void;
  onSendMessage: () => void;
}

export function MessagesComposer({
  conversationId,
  draftMessage,
  onDraftMessageChange,
  onSendMessage,
}: MessagesComposerProps) {
  return (
    <div className="border-t border-border/70 bg-background/90 px-4 py-4">
      <div className="mx-auto flex max-w-4xl items-end gap-3 rounded-[1.75rem] border border-border bg-muted/25 px-3 py-3 shadow-sm">
        <div className="flex items-center gap-2 pb-1">
          <button
            key={`${conversationId}-composer-image`}
            type="button"
            className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <ImagePlus size={18} />
          </button>
        </div>

        <textarea
          value={draftMessage}
          onChange={(event) => onDraftMessageChange(event.target.value)}
          placeholder="Message..."
          rows={1}
          className="max-h-32 min-h-[44px] flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground"
        />

        {draftMessage.trim() ? (
          <Button
            type="button"
            onClick={onSendMessage}
            className="rounded-full px-5"
          >
            Send
          </Button>
        ) : (
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label="Like conversation"
          >
            <Heart size={19} />
          </button>
        )}
      </div>
    </div>
  );
}
