export type MessageAuthor = "me" | "them";

export interface MessageItem {
  id: string;
  author: MessageAuthor;
  text: string;
  time: string;
  seen?: boolean;
}

export interface Conversation {
  id: string;
  username: string;
  fullName: string;
  preview: string;
  activeMinutesAgo: number;
  unreadCount?: number;
  isOnline?: boolean;
  accent: string;
  messages: MessageItem[];
}
