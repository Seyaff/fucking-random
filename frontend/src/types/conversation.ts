export interface Conversation {
  _id: string;
  userId: string;
  customerPhone: string;
  customerName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  status: "active" | "resolved" | "human_handling";
  escalatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageMetadata {
  trace?: {
    intent: string;
    handler: string;
    toolsCalled: string[];
  };
}

export interface Message {
  _id: string;
  conversationId: string;
  role: "user" | "assistant" | "agent";
  content: string;
  metadata?: MessageMetadata;
  createdAt: string;
}
