import type { User } from "@/features/auth/types";
import type { Conversation } from "./types";

export function formatLastActive(minutesAgo: number) {
  if (minutesAgo < 60) return `${minutesAgo}m`;
  const hours = Math.floor(minutesAgo / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function getConversationUser(conversation: Conversation): User {
  const [firstName = conversation.fullName, lastName = ""] = conversation.fullName.split(" ");

  return {
    id: conversation.id,
    username: conversation.username,
    email: `${conversation.username}@example.com`,
    firstName,
    lastName,
  };
}
