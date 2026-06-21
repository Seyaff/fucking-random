"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Loader2, AlertCircle, Inbox, ArrowLeft, ExternalLink } from "lucide-react";
import { connectorService } from "@/services/connector.service";
import { useConnectorStatuses } from "@/hooks/use-connectors";
import Link from "next/link";
import type { GmailEmail, GmailEmailDetail } from "@/types/connector";

export default function GmailPage() {
  const { data: statuses, isLoading: statusLoading } = useConnectorStatuses();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const emailsQuery = useQuery({
    queryKey: ["connectors", "gmail", "data"],
    queryFn: connectorService.fetchGmailData,
    enabled: statuses?.gmail?.isConnected ?? false,
  });

  const detailQuery = useQuery({
    queryKey: ["connectors", "gmail", "detail", selectedId],
    queryFn: () => connectorService.fetchGmailEmailDetail(selectedId!),
    enabled: !!selectedId,
  });

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!statuses?.gmail?.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Mail className="size-10 text-muted-foreground" />
        <p className="text-muted-foreground">Gmail is not connected</p>
        <Link href="/connectors" className="text-sm text-primary underline">
          Connect Gmail
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
            <Mail className="size-5" />
            Gmail Inbox
          </h1>
          <p className="text-sm text-muted-foreground">{statuses.gmail.email}</p>
        </div>
      </div>

      {selectedId && detailQuery.data ? (
        <EmailDetailView
          email={detailQuery.data}
          onBack={() => setSelectedId(null)}
        />
      ) : (
        <EmailListView
          emails={emailsQuery.data ?? []}
          isLoading={emailsQuery.isLoading}
          isError={emailsQuery.isError}
          onSelect={setSelectedId}
        />
      )}
    </div>
  );
}

function EmailListView({
  emails,
  isLoading,
  isError,
  onSelect,
}: {
  emails: GmailEmail[];
  isLoading: boolean;
  isError: boolean;
  onSelect: (id: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading emails...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <AlertCircle className="size-8 text-red-500" />
        <p className="text-sm text-muted-foreground">Failed to load emails</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <Inbox className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No emails found</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card divide-y">
      {emails.map((email) => (
        <button
          key={email.id}
          onClick={() => onSelect(email.id)}
          className="w-full text-left p-4 hover:bg-muted/50 transition-colors flex flex-col gap-1"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm truncate">{email.from}</span>
            <span className="text-xs text-muted-foreground shrink-0 ml-2">
              {formatDate(email.date)}
            </span>
          </div>
          <span className="text-sm font-medium truncate">{email.subject}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">{email.snippet}</span>
        </button>
      ))}
    </div>
  );
}

function EmailDetailView({
  email,
  onBack,
}: {
  email: GmailEmailDetail;
  onBack: () => void;
}) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
      </div>
      <div className="p-5 space-y-4">
        <h2 className="text-xl font-semibold">{email.subject}</h2>
        <div className="text-sm space-y-1 text-muted-foreground">
          <p><span className="font-medium text-foreground">From:</span> {email.from}</p>
          {email.to && <p><span className="font-medium text-foreground">To:</span> {email.to}</p>}
          {email.cc && <p><span className="font-medium text-foreground">Cc:</span> {email.cc}</p>}
          <p><span className="font-medium text-foreground">Date:</span> {email.date}</p>
        </div>
        <div className="border-t pt-4">
          {email.body ? (
            <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
              {email.body}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground italic">No plain text content</p>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}
