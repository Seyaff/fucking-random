import type { Message } from "@/types/conversation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

interface MessageBubbleProps {
  message: Message;
}

const roleLabel: Record<string, string> = {
  user: "Customer",
  assistant: "AI",
  agent: "You",
};

const roleColor: Record<string, string> = {
  user: "bg-primary text-primary-foreground ml-12",
  assistant: "bg-muted mr-12",
  agent: "bg-secondary text-secondary-foreground ml-12",
};

const roleAlign: Record<string, string> = {
  user: "items-end",
  assistant: "items-start",
  agent: "items-end",
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const label = roleLabel[message.role] ?? message.role;
  const trace = message.metadata?.trace;

  return (
    <div className={cn("flex flex-col", roleAlign[message.role])}>
      <div className="flex items-center gap-2 px-1 mb-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        {trace && message.role === "assistant" && (
          <div className="flex gap-1">
            <Badge variant="outline" className="text-[9px] h-4 px-1">
              {trace.intent}
            </Badge>
            {trace.toolsCalled?.map((tool) => (
              <Badge key={tool} variant="secondary" className="text-[9px] h-4 px-1 font-mono">
                {tool}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 break-words max-w-[75%]",
          roleColor[message.role]
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <span className="text-[10px] opacity-60 mt-1 block text-right">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
