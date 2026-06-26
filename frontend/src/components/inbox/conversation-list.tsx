import type { Conversation } from "@/types/conversation";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatPhone(phone: string) {
  if (phone.startsWith("91") && phone.length > 10) {
    return `+${phone.slice(0, 2)} ${phone.slice(2, 7)} ${phone.slice(7)}`;
  }
  return phone;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="w-80 border-r flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground text-center">
          No conversations yet
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 border-r flex flex-col overflow-hidden">
      <div className="p-3 border-b">
        <h2 className="font-semibold text-sm">Conversations</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <button
            key={conv._id}
            onClick={() => onSelect(conv._id)}
            className={cn(
              "w-full text-left p-3 border-b hover:bg-muted/50 transition-colors flex gap-3 items-start",
              selectedId === conv._id && "bg-muted"
            )}
          >
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-medium text-primary">
              {(conv.customerName || conv.customerPhone).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium truncate">
                  {conv.customerName || formatPhone(conv.customerPhone)}
                </span>
                {conv.lastMessageAt && (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {timeAgo(conv.lastMessageAt)}
                  </span>
                )}
              </div>
              {conv.lastMessage && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {conv.lastMessage}
                </p>
              )}
              <div className="flex items-center justify-between mt-1">
                {conv.unreadCount > 0 && (
                  <span className="text-[10px] font-medium text-primary-foreground bg-primary rounded-full px-1.5 py-0.5 leading-none">
                    {conv.unreadCount}
                  </span>
                )}
                <span
                  className={cn(
                    "text-[10px] capitalize",
                    conv.status === "resolved"
                      ? "text-green-600"
                      : conv.status === "human_handling"
                        ? "text-amber-600"
                        : "text-muted-foreground"
                  )}
                >
                  {conv.status === "human_handling" ? "human" : conv.status}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
