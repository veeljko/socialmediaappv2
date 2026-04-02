import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/myComponents/Profile/UserAvatar";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/features/message/types";
import { getConversationUser } from "@/features/message/utils";

interface MessagesChatIntroProps {
  conversation: Conversation;
}

export function MessagesChatIntro({ conversation }: MessagesChatIntroProps) {
  const conversationUser = getConversationUser(conversation);

  return (
    <div className="mb-7 flex flex-col items-center text-center">
      <div className={cn("rounded-full bg-gradient-to-br p-[3px]", conversation.accent)}>
        <div className="rounded-full bg-background p-[3px]">
          <UserAvatar profileData={conversationUser} size="xl" />
        </div>
      </div>
      <p className="mt-4 text-xl font-semibold tracking-tight">
        {conversation.fullName}
      </p>
      <Button
        variant="outline"
        className="mt-4 rounded-full"
      >
        View profile
      </Button>
    </div>
  );
}
