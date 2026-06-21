"use client";

import { MessageSquare, Users, DollarSign, Send } from "lucide-react";
import { KpiCard } from "@/components/analytics/kpi-card";
import { QuickActions } from "@/components/analytics/quick-actions";
import { ConversationsChart } from "@/components/analytics/conversations-chart";
import { PipelineChart } from "@/components/analytics/pipeline-chart";
import { FirstResponseTime } from "@/components/analytics/first-response-time";
import { RecentActivity } from "@/components/analytics/recent-activity";
import { ConnectorData } from "@/components/connectors/connector-data";

export default function AnalyticsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Real-time overview of your business</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KpiCard
          title="Active Conversations"
          value="1,247"
          delta={12.5}
          icon={<MessageSquare className="size-4" />}
        />
        <KpiCard
          title="New Contacts Today"
          value="84"
          delta={23.1}
          icon={<Users className="size-4" />}
        />
        <KpiCard
          title="Open Deals Value"
          value="$48.9K"
          delta={-3.2}
          icon={<DollarSign className="size-4" />}
        />
        <KpiCard
          title="Messages Sent Today"
          value="3,842"
          delta={8.7}
          icon={<Send className="size-4" />}
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
