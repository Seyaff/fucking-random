"use client";

import { useState, useEffect, useCallback } from "react";
import type { Conversation, Message } from "@/types/conversation";
import { conversationService } from "@/services/conversation.service";
import { ConversationList } from "@/components/inbox/conversation-list";
import { ChatView } from "@/components/inbox/chat-view";
import { Loader2 } from "lucide-react";

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const selectedConv = conversations.find((c) => c._id === selectedId) ?? null;

  const fetchConversations = useCallback(async () => {
    try {
      const list = await conversationService.list();
      setConversations(list);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Poll for new conversations/messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Poll for new messages in selected conversation
  useEffect(() => {
    if (!selectedId) return;
    const interval = setInterval(async () => {
      try {
        const data = await conversationService.getMessages(selectedId);
        setMessages(data.messages);
      } catch {
        // ignore
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedId]);

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    setLoadingMessages(true);
    setMessages([]);
    try {
      const data = await conversationService.getMessages(id);
      setMessages(data.messages);
      await conversationService.markAsRead(id);
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, unreadCount: 0 } : c))
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async (content: string) => {
    if (!selectedId) return;
    const msg = await conversationService.sendMessage(selectedId, content);
    setMessages((prev) => [...prev, msg]);
    setConversations((prev) =>
      prev.map((c) =>
        c._id === selectedId
          ? { ...c, lastMessage: content.slice(0, 100), lastMessageAt: new Date().toISOString() }
          : c
      )
    );
  };

  const handleResolve = async () => {
    if (!selectedId) return;
    await conversationService.resolve(selectedId);
    setConversations((prev) =>
      prev.map((c) => (c._id === selectedId ? { ...c, status: "resolved" } : c))
    );
  };

  if (loadingList) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full -m-4 md:-m-6">
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
      <ChatView
        conversation={selectedConv}
        messages={messages}
        isLoading={loadingMessages}
        onSend={handleSend}
        onResolve={handleResolve}
      />
    </div>
  );
}
