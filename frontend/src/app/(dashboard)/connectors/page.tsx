"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, MessageSquare, ArrowRight } from "lucide-react";
import { useConnectorStatuses, useDisconnectGmail, useDisconnectSlack } from "@/hooks/use-connectors";
import { ConnectorCard } from "@/components/connectors/connector-card";
import { connectorService } from "@/services/connector.service";

export default function ConnectorsPage() {
  const searchParams = useSearchParams();
  const { data: statuses, isLoading } = useConnectorStatuses();
  const disconnectGmail = useDisconnectGmail();
  const disconnectSlack = useDisconnectSlack();

  useEffect(() => {
    const connected = searchParams.get("connected");
    if (connected === "gmail") {
      toast.success("Gmail connected successfully!");
    } else if (connected === "slack") {
      toast.success("Slack connected successfully!");
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Connectors</h1>
        <p className="text-sm text-muted-foreground">
          Connect your Gmail and Slack to view data on your dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <ConnectorCard
          provider="gmail"
          isConnected={statuses?.gmail?.isConnected ?? false}
          accountLabel={statuses?.gmail?.email ?? null}
          onConnect={async () => {
            const url = await connectorService.getGmailAuthUrl();
            window.location.href = url;
          }}
          onDisconnect={() => disconnectGmail.mutate()}
        />
        <ConnectorCard
          provider="slack"
          isConnected={statuses?.slack?.isConnected ?? false}
          accountLabel={statuses?.slack?.teamName ?? null}
          onConnect={async () => {
            const url = await connectorService.getSlackAuthUrl();
            window.location.href = url;
          }}
          onDisconnect={() => disconnectSlack.mutate()}
        />
      </div>

      {(statuses?.gmail?.isConnected || statuses?.slack?.isConnected) && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Dashboards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            {statuses?.gmail?.isConnected && (
              <Link
                href="/connectors/gmail"
                className="rounded-xl border bg-card p-5 flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Gmail Inbox</h3>
                    <p className="text-xs text-muted-foreground">View and read emails</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            )}
            {statuses?.slack?.isConnected && (
              <Link
                href="/connectors/slack"
                className="rounded-xl border bg-card p-5 flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <MessageSquare className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Slack Messages</h3>
                    <p className="text-xs text-muted-foreground">Browse channel messages</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
