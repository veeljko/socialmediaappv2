import { useMemo, useState } from "react";
import { useGetAuthedUserInfoQuery } from "@/services/authApi";
import { initialConversations } from "@/features/message/dummyData";
import type { Conversation } from "@/features/message/types";
import { MessagesSidebarPanel } from "@/myComponents/messages/MessagesSidebarPanel";
import { MessagesChatPanel } from "@/myComponents/messages/MessagesChatPanel";
import { useMessageComposer } from "@/hooks/useMessageComposer";

export default function MessagesPage() {
  const { data: authedUser } = useGetAuthedUserInfoQuery();
  const [searchValue, setSearchValue] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState(
    initialConversations[0]?.id ?? ""
  );

  const filteredConversations = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) return conversations;

    return conversations.filter((conversation) =>
      [conversation.fullName, conversation.username, conversation.preview]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [conversations, searchValue]);

  const activeConversation =
    filteredConversations.find((conversation) => conversation.id === activeConversationId) ??
    conversations.find((conversation) => conversation.id === activeConversationId) ??
    filteredConversations[0] ??
    conversations[0];

  const { handleSendMessage } = useMessageComposer({
    activeConversation,
    draftMessage,
    setDraftMessage,
    setConversations,
  });

  return (
    <div className="h-screen overflow-hidden">
      <div className="grid h-full min-h-0 overflow-hidden  bg-card/95 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        <MessagesSidebarPanel
          authedUsername={authedUser?.username}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          conversations={filteredConversations}
          activeConversationId={activeConversation?.id}
          onSelectConversation={setActiveConversationId}
        />

        <MessagesChatPanel
          activeConversation={activeConversation}
          draftMessage={draftMessage}
          onDraftMessageChange={setDraftMessage}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
