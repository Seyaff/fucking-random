"use client";

import { useState } from "react";
import { Mail, Hash, Link2, Link2Off, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ConnectorCardProps {
  provider: "gmail" | "slack";
  isConnected: boolean;
  accountLabel?: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

const providerConfig = {
  gmail: {
    name: "Gmail",
    icon: "./gmail.svg",
    color: "bg-red-50 text-red-600",
    border: "border-red-200",
  },
  slack: {
    name: "Slack",
    icon: "./slack.svg",
    color: "bg-purple-50 text-purple-600",
    border: "border-purple-200",
  },
};

export function ConnectorCard({
  provider,
  isConnected,
  accountLabel,
  onConnect,
  onDisconnect,
}: ConnectorCardProps) {
  const [disconnecting, setDisconnecting] = useState(false);
  const config = providerConfig[provider];

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 flex flex-col gap-4 transition-shadow hover:shadow-sm",
        isConnected && config.border
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "size-10 rounded-lg flex items-center justify-center",
              
            )}
          >
            
            <Image width={60} height={60} className="size-4" src={config.icon} alt="slack" />
          </div>
          <div>
            <h3 className="font-semibold">{config.name}</h3>
            {isConnected && accountLabel ? (
              <p className="text-xs text-muted-foreground">{accountLabel}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Not connected</p>
            )}
          </div>
        </div>
        <div
          className={cn(
            "size-2.5 rounded-full",
            isConnected ? "bg-green-500" : "bg-gray-300"
          )}
        />
      </div>

      {isConnected ? (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-red-600 hover:text-red-700"
            disabled={disconnecting}
            onClick={async () => {
              setDisconnecting(true);
              try {
                await onDisconnect();
              } finally {
                setDisconnecting(false);
              }
            }}
          >
            {disconnecting ? (
              <Loader2 className="size-4 mr-1 animate-spin" />
            ) : (
              <Link2Off className="size-4 mr-1" />
            )}
            Disconnect
          </Button>
        </div>
      ) : (
        <Button size="sm" className="w-full" onClick={onConnect}>
          <Link2 className="size-4 mr-1" />
          Connect
          <ExternalLink className="size-3 ml-1" />
        </Button>
      )}
    </div>
  );
}
