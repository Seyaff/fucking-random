"use client";

import type { AgentTrace } from "@/types/agent";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface AgentTracePanelProps {
  traces: AgentTrace[];
  isLoading: boolean;
}

export function AgentTracePanel({ traces, isLoading }: AgentTracePanelProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (traces.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-6">
        No agent traces for this conversation yet.
      </p>
    );
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {traces.map((trace) => (
        <div key={trace._id} className="rounded-lg border p-3 space-y-2 text-xs">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-[10px]">
              {trace.intent}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {trace.handler}
            </Badge>
            <span className="text-muted-foreground ml-auto">{trace.latencyMs}ms</span>
          </div>
          <p className="text-muted-foreground truncate">
            <span className="font-medium text-foreground">In:</span> {trace.inboundMessage}
          </p>
          <p className="truncate">
            <span className="font-medium">Out:</span> {trace.outboundMessage}
          </p>
          {trace.toolsCalled.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {trace.toolsCalled.map((t, i) => (
                <Badge key={i} variant="outline" className="text-[10px] font-mono">
                  {t.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
