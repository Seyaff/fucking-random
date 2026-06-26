"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { agentService } from "@/services/agent.service";
import { Loader2, Send, Bot, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  trace?: { intent: string; handler: string; toolsCalled: string[] };
}

export default function AgentTestPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const { reply, trace } = await agentService.test(text);
      setMessages((prev) => [...prev, { role: "assistant", content: reply, trace }]);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Agent failed to respond";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) handleSend();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Test Agent</h1>
        <p className="text-sm text-muted-foreground">
          Chat with the AI agent to test product lookups, pricing, orders, and language support
        </p>
      </div>

      <Card className="flex flex-col h-[calc(100vh-16rem)]">
        <CardHeader className="pb-3 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="size-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm">Relay AI Agent</CardTitle>
                <CardDescription className="text-[10px]">Intent router + tools + flows</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] gap-1">
              <span className="size-1.5 rounded-full bg-green-500 inline-block" />
              Online
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Bot className="size-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Start a conversation</p>
              <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
                Try: &quot;what products do you have?&quot; or &quot;I want to order maple syrup&quot;
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2 max-w-[85%]",
                m.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                {m.role === "user" ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
              </div>
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                {m.content}
                {m.trace && m.role === "assistant" && (
                  <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/50">
                    <span className="text-[10px] text-muted-foreground">{m.trace.intent}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground">{m.trace.handler}</span>
                    {m.trace.toolsCalled?.map((t) => (
                      <span key={t} className="text-[10px] font-mono bg-background/50 px-1 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 items-center text-muted-foreground text-sm">
              <Loader2 className="size-4 animate-spin" />
              Thinking...
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </CardContent>

        <CardFooter className="border-t p-3 shrink-0">
          <div className="flex items-center gap-2 w-full">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about products, prices, or place an order..."
              disabled={loading}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSend} disabled={!input.trim() || loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
