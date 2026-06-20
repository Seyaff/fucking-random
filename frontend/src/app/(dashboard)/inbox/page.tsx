"use client";

import { useState } from "react";
import { useConversations, useMessages, useSendMessage, useMarkAsRead, useResolveConversation } from "@/hooks/use-conversations";
import { ConversationList } from "@/components/inbox/conversation-list";
import { ChatView } from "@/components/inbox/chat-view";
import { Loader2 } from "lucide-react";

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: conversations = [], isLoading: loadingConversations } = useConversations();
  const { data: messagesData, isLoading: loadingMessages } = useMessages(selectedId);
  const { mutateAsync: sendMessage } = useSendMessage();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: resolveConversation } = useResolveConversation();

  const selectedConv = conversations.find((c) => c._id === selectedId) ?? null;
  const messages = messagesData?.messages ?? [];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    markAsRead(id);
  };

  const handleSend = async (content: string) => {
    if (!selectedId) return;
    await sendMessage({ conversationId: selectedId, content });
  };

  const handleResolve = () => {
    if (!selectedId) return;
    resolveConversation(selectedId);
  };

  if (loadingConversations) {
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
