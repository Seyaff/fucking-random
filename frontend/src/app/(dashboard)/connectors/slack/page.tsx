"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Hash, Loader2, AlertCircle, MessageSquare, ArrowLeft } from "lucide-react";
import { connectorService } from "@/services/connector.service";
import { useConnectorStatuses } from "@/hooks/use-connectors";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SlackMessage } from "@/types/connector";

export default function SlackPage() {
  const { data: statuses, isLoading: statusLoading } = useConnectorStatuses();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const messagesQuery = useQuery({
    queryKey: ["connectors", "slack", "data"],
    queryFn: connectorService.fetchSlackData,
    enabled: statuses?.slack?.isConnected ?? false,
  });

  const channels = useMemo(() => {
    const data = messagesQuery.data ?? [];
    const map = new Map<string, SlackMessage[]>();
    for (const msg of data) {
      if (!map.has(msg.channelName)) map.set(msg.channelName, []);
      map.get(msg.channelName)!.push(msg);
    }
    return Array.from(map.entries()).map(([name, msgs]) => ({
      name,
      messages: msgs.sort((a, b) => parseFloat(b.timestamp) - parseFloat(a.timestamp)),
    }));
  }, [messagesQuery.data]);

  const selectedMessages = useMemo(() => {
    if (!selectedChannel) return [];
    const ch = channels.find((c) => c.name === selectedChannel);
    return ch?.messages ?? [];
  }, [channels, selectedChannel]);

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!statuses?.slack?.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <MessageSquare className="size-10 text-muted-foreground" />
        <p className="text-muted-foreground">Slack is not connected</p>
        <Link href="/connectors" className="text-sm text-primary underline">
          Connect Slack
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/connectors" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <MessageSquare className="size-5" />
            Slack Messages
          </h1>
          {statuses.slack.teamName && (
            <p className="text-sm text-muted-foreground">{statuses.slack.teamName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 rounded-xl border bg-card p-3 space-y-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
            Channels
          </h3>
          {messagesQuery.isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            channels.map((ch) => (
              <button
                key={ch.name}
                onClick={() => setSelectedChannel(ch.name)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors",
                  selectedChannel === ch.name
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Hash className="size-3.5 shrink-0" />
                <span className="truncate">{ch.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{ch.messages.length}</span>
              </button>
            ))
          )}
        </div>

        <div className="md:col-span-3 rounded-xl border bg-card">
          {selectedChannel ? (
            <ChannelMessages channelName={selectedChannel} messages={selectedMessages} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Hash className="size-10 mb-2" />
              <p className="text-sm">Select a channel to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChannelMessages({
  channelName,
  messages,
}: {
  channelName: string;
  messages: SlackMessage[];
}) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">No messages in #{channelName}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b">
        <h2 className="font-semibold flex items-center gap-2">
          <Hash className="size-4" />
          {channelName}
        </h2>
      </div>
      <div className="divide-y overflow-y-auto max-h-[600px]">
        {messages.map((msg, i) => (
          <div key={`${msg.timestamp}-${i}`} className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-sm">@{msg.user}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatSlackTs(msg.timestamp)}
              </span>
            </div>
            <p className="text-sm mt-1 whitespace-pre-wrap">{msg.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatSlackTs(ts: string): string {
  try {
    const date = new Date(parseFloat(ts) * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return ts;
  }
}
