export interface Conversation {
  _id: string;
  userId: string;
  customerPhone: string;
  customerName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  status: "active" | "resolved";
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  role: "user" | "assistant" | "agent";
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
