import { useState, useRef, useEffect } from "react";
import type { Conversation, Message } from "@/types/conversation";
import type { AgentTrace } from "@/types/agent";
import { MessageBubble } from "./message-bubble";
import { AgentTracePanel } from "./agent-trace-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Phone, Bot, UserRound } from "lucide-react";

interface ChatViewProps {
  conversation: Conversation | null;
  messages: Message[];
  traces: AgentTrace[];
  tracesLoading: boolean;
  isLoading: boolean;
  onSend: (content: string) => Promise<void>;
  onResolve: () => void;
  onResumeBot: () => void;
}

function formatPhone(phone: string) {
  if (phone.startsWith("91") && phone.length > 10) {
    return `+${phone.slice(0, 2)} ${phone.slice(2, 7)} ${phone.slice(7)}`;
  }
  return phone;
}

const statusBadge: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  resolved: "bg-muted text-muted-foreground",
  human_handling: "bg-amber-100 text-amber-800",
};

export function ChatView({
  conversation,
  messages,
  traces,
  tracesLoading,
  isLoading,
  onSend,
  onResolve,
  onResumeBot,
}: ChatViewProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showTraces, setShowTraces] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Phone className="size-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setInput("");
    try {
      await onSend(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isHuman = conversation.status === "human_handling";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-3 border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
            {(conversation.customerName || conversation.customerPhone).charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">
              {conversation.customerName || formatPhone(conversation.customerPhone)}
            </p>
            <Badge className={`text-[10px] h-5 ${statusBadge[conversation.status] ?? ""}`}>
              {isHuman ? "Human handling" : conversation.status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isHuman ? (
            <Button variant="outline" size="sm" onClick={onResumeBot} className="text-xs h-8 gap-1">
              <Bot className="size-3.5" />
              Resume bot
            </Button>
          ) : conversation.status === "active" ? (
            <Button variant="outline" size="sm" onClick={onResolve} className="text-xs h-8">
              Resolve
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTraces(!showTraces)}
            className="text-xs h-8"
          >
            {showTraces ? "Hide" : "Show"} traces
          </Button>
        </div>
      </div>

      {isHuman && (
        <div className="px-3 py-2 bg-amber-50 border-b text-xs text-amber-800 flex items-center gap-2">
          <UserRound className="size-3.5 shrink-0" />
          Bot is paused. You are handling this conversation.
        </div>
      )}

      {showTraces && (
        <div className="border-b p-3 bg-muted/30 shrink-0">
          <p className="text-xs font-medium mb-2">Agent trace</p>
          <AgentTracePanel traces={traces} isLoading={tracesLoading} />
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <MessageBubble key={msg._id} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="p-3 border-t shrink-0">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isHuman ? "Reply as human agent..." : "Type a message..."}
            disabled={sending}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend} disabled={!input.trim() || sending}>
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
