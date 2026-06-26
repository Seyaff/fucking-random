"use client";

import { MessageSquare, Users, Clock, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/components/analytics/kpi-card";
import { QuickActions } from "@/components/analytics/quick-actions";
import { ConversationsChart } from "@/components/analytics/conversations-chart";
import { PipelineChart } from "@/components/analytics/pipeline-chart";
import { FirstResponseTime } from "@/components/analytics/first-response-time";
import { RecentActivity } from "@/components/analytics/recent-activity";
import { ConnectorData } from "@/components/connectors/connector-data";
import { useAgentStats } from "@/hooks/use-agent-stats";
import { useConversations } from "@/hooks/use-conversations";
import { Loader2 } from "lucide-react";

export default function AnalyticsPage() {
  const { data: agentData, isLoading: loadingStats } = useAgentStats(7);
  const { data: conversations = [], isLoading: loadingConversations } = useConversations();

  const stats = agentData?.stats;
  const activeConversations = conversations.filter((c) => c.status === "active").length;
  const humanHandling = conversations.filter((c) => c.status === "human_handling").length;
  const escalationRate =
    stats && stats.messagesHandled > 0
      ? ((stats.escalations / stats.messagesHandled) * 100).toFixed(1)
      : "0";

  if (loadingStats && loadingConversations) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Live agent metrics from the last {agentData?.periodDays ?? 7} days
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KpiCard
          title="Messages Handled"
          value={String(stats?.messagesHandled ?? 0)}
          icon={<MessageSquare className="size-4" />}
          subtitle="by AI agent"
        />
        <KpiCard
          title="Active Conversations"
          value={String(activeConversations)}
          icon={<Users className="size-4" />}
          subtitle={`${humanHandling} with human`}
        />
        <KpiCard
          title="Avg Response Time"
          value={`${stats?.avgLatencyMs ?? 0}ms`}
          icon={<Clock className="size-4" />}
          subtitle="agent latency"
        />
        <KpiCard
          title="Escalation Rate"
          value={`${escalationRate}%`}
          icon={<AlertTriangle className="size-4" />}
          subtitle={`${stats?.escalations ?? 0} escalations`}
        />
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ConversationsChart />
        <PipelineChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FirstResponseTime />
        <RecentActivity />
      </div>

      <ConnectorData />
    </div>
  );
}
