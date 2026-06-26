import api from "./api";
import type { Conversation, Message } from "@/types/conversation";
import type { AgentTrace } from "@/types/agent";

export const conversationService = {
  list: async (): Promise<Conversation[]> => {
    const { data } = await api.get("/conversations");
    return data.conversations;
  },

  getMessages: async (
    conversationId: string
  ): Promise<{ conversation: Conversation; messages: Message[] }> => {
    const { data } = await api.get(`/conversations/${conversationId}/messages`);
    return data;
  },

  sendMessage: async (
    conversationId: string,
    content: string
  ): Promise<Message> => {
    const { data } = await api.post(`/conversations/${conversationId}/messages`, {
      content,
    });
    return data.message;
  },

  markAsRead: async (conversationId: string): Promise<void> => {
    await api.patch(`/conversations/${conversationId}/read`);
  },

  resolve: async (conversationId: string): Promise<void> => {
    await api.patch(`/conversations/${conversationId}/resolve`);
  },

  resumeBot: async (conversationId: string): Promise<void> => {
    await api.patch(`/conversations/${conversationId}/resume-bot`);
  },

  getTraces: async (conversationId: string): Promise<AgentTrace[]> => {
    const { data } = await api.get(`/conversations/${conversationId}/traces`);
    return data.traces;
  },
};
