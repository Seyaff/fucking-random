"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { env } from "@/config/env";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2, Send, Bot, User, AlertCircle, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export default function AgentTestPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setError(null);

    const userMsg: ChatMessage = { role: "user", content: text };
    const assistantMsg: ChatMessage = { role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`${env.API_URL}/agent/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Stream request failed");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (!json) continue;

          try {
            const data = JSON.parse(json);
            if (data.token) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.streaming) {
                  last.content += data.token;
                }
                return updated;
              });
            }
            if (data.done) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last) last.streaming = false;
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.streaming) {
            last.streaming = false;
            if (!last.content) last.content = "(Cancelled)";
          }
          return updated;
        });
      } else {
        const msg = (err as { message?: string })?.message || "Agent failed to respond";
        setError(msg);
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.streaming) {
            last.streaming = false;
            if (!last.content) last.content = "(Error)";
          }
          return updated;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, streaming, accessToken]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (streaming) {
        handleStop();
      } else {
        handleSend();
      }
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
                <CardDescription className="text-[10px]">Llama 3.3 70B · streaming</CardDescription>
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
                Try asking about products, prices, or place an order. The agent speaks your language.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2 max-w-[80%]",
                m.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                {m.role === "user" ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
              </div>
              <div className={cn(
                "rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted",
                m.streaming && "border-l-2 border-primary animate-pulse"
              )}>
                {m.content}
                {m.streaming && <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-blink" />}
              </div>
            </div>
          ))}

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
              disabled={streaming}
              className="flex-1"
            />
            {streaming ? (
              <Button size="icon" variant="destructive" onClick={handleStop}>
                <StopCircle className="size-4" />
              </Button>
            ) : (
              <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
                <Send className="size-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
