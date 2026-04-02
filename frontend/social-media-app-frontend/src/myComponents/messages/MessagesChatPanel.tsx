import type { Conversation } from "@/features/message/types";
import { MessagesEmptyState } from "./MessagesEmptyState";
import { MessagesChatHeader } from "./MessagesChatHeader";
import { MessagesChatIntro } from "./MessagesChatIntro";
import { MessageBubble } from "./MessageBubble";
import { MessagesComposer } from "./MessagesComposer";

interface MessagesChatPanelProps {
  activeConversation?: Conversation;
  draftMessage: string;
  onDraftMessageChange: (value: string) => void;
  onSendMessage: () => void;
}

export function MessagesChatPanel({
  activeConversation,
  draftMessage,
  onDraftMessageChange,
  onSendMessage,
}: MessagesChatPanelProps) {
  if (!activeConversation) {
    return <MessagesEmptyState />;
  }

  return (
    <section className="flex min-h-0 flex-col bg-gradient-to-b from-background via-background to-muted/20">
      <MessagesChatHeader conversation={activeConversation} />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto flex max-w-4xl flex-col">
          <MessagesChatIntro conversation={activeConversation} />

          <div className="space-y-3">
            {activeConversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        </div>
      </div>

      <MessagesComposer
        conversationId={activeConversation.id}
        draftMessage={draftMessage}
        onDraftMessageChange={onDraftMessageChange}
        onSendMessage={onSendMessage}
      />
    </section>
  );
}
