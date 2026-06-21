"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Hash, Loader2, AlertCircle, Inbox, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { connectorService } from "@/services/connector.service";
import { useConnectorStatuses } from "@/hooks/use-connectors";
import type { GmailEmail, SlackMessage } from "@/types/connector";

export function ConnectorData() {
  const { data: statuses } = useConnectorStatuses();
  const [selected, setSelected] = useState<"gmail" | "slack" | null>(null);

  const gmailConnected = statuses?.gmail?.isConnected ?? false;
  const slackConnected = statuses?.slack?.isConnected ?? false;

  const gmailQuery = useQuery({
    queryKey: ["connectors", "gmail", "data"],
    queryFn: connectorService.fetchGmailData,
    enabled: selected === "gmail",
  });

  const slackQuery = useQuery({
    queryKey: ["connectors", "slack", "data"],
    queryFn: connectorService.fetchSlackData,
    enabled: selected === "slack",
  });

  if (!gmailConnected && !slackConnected) return null;

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Connected Tools</h2>
        <div className="flex gap-1">
          {gmailConnected && (
            <button
              onClick={() => setSelected(selected === "gmail" ? null : "gmail")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                selected === "gmail"
                  ? "bg-red-100 text-red-700"
                  : "bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-600"
              )}
            >
              <Mail className="size-3.5" />
              Gmail
            </button>
          )}
          {slackConnected && (
            <button
              onClick={() => setSelected(selected === "slack" ? null : "slack")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                selected === "slack"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-muted text-muted-foreground hover:bg-purple-50 hover:text-purple-600"
              )}
            >
              <Hash className="size-3.5" />
              Slack
            </button>
          )}
        </div>
      </div>

      {selected === "gmail" && <GmailData query={gmailQuery} />}
      {selected === "slack" && <SlackData query={slackQuery} />}
    </div>
  );
}

function GmailData({ query }: { query: ReturnType<typeof useQuery<GmailEmail[]>> }) {
  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading emails...</span>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-red-600">
        <AlertCircle className="size-4" />
        Failed to load emails. Try reconnecting.
      </div>
    );
  }

  const emails = query.data ?? [];

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-muted-foreground">
        <Inbox className="size-8 mb-2" />
        <p className="text-sm">No emails found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {emails.slice(0, 5).map((email) => (
        <div
          key={email.id}
          className="flex flex-col gap-0.5 rounded-lg border p-3 text-sm hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium truncate">{email.from}</span>
            <span className="text-xs text-muted-foreground shrink-0 ml-2">
              {new Date(email.date).toLocaleDateString()}
            </span>
          </div>
          <span className="font-medium text-xs truncate">{email.subject}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">{email.snippet}</span>
        </div>
      ))}
    </div>
  );
}

function SlackData({ query }: { query: ReturnType<typeof useQuery<SlackMessage[]>> }) {
  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading messages...</span>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-red-600">
        <AlertCircle className="size-4" />
        Failed to load messages. Try reconnecting.
      </div>
    );
  }

  const messages = query.data ?? [];

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-muted-foreground">
        <MessageSquare className="size-8 mb-2" />
        <p className="text-sm">No messages found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.slice(0, 5).map((msg, i) => (
        <div
          key={`${msg.channelId}-${msg.timestamp}-${i}`}
          className="flex flex-col gap-0.5 rounded-lg border p-3 text-sm hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-xs text-muted-foreground">
              #{msg.channelName}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(parseFloat(msg.timestamp) * 1000).toLocaleDateString()}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">@{msg.user}</span>
          <span className="text-xs line-clamp-2">{msg.text}</span>
        </div>
      ))}
    </div>
  );
}
