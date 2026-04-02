import type { Dispatch, SetStateAction } from "react";
import type { Conversation } from "@/features/message/types";

interface UseMessageComposerParams {
  activeConversation?: Conversation;
  draftMessage: string;
  setDraftMessage: Dispatch<SetStateAction<string>>;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
}

export function useMessageComposer({
  activeConversation,
  draftMessage,
  setDraftMessage,
  setConversations,
}: UseMessageComposerParams) {
  const handleSendMessage = () => {
    const nextMessage = draftMessage.trim();
    if (!nextMessage || !activeConversation) return;

    setConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== activeConversation.id) return conversation;

        return {
          ...conversation,
          preview: nextMessage,
          activeMinutesAgo: 0,
          messages: [
            ...conversation.messages,
            {
              id: `${conversation.id}-${Date.now()}`,
              author: "me",
              text: nextMessage,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              seen: true,
            },
          ],
        };
      })
    );

    setDraftMessage("");
  };

  return { handleSendMessage };
}
