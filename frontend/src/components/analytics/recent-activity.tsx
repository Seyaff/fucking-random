"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "contact" | "deal" | "message" | "broadcast" | "system";
  label: string;
  description: string;
  time: string;
}

const activities: Activity[] = [
  { id: "1", type: "message", label: "Sarah Chen", description: "Sent a message via WhatsApp", time: "2m ago" },
  { id: "2", type: "deal", label: "Acme Corp Deal", description: "Moved to Negotiation stage", time: "8m ago" },
  { id: "3", type: "contact", label: "James Wilson", description: "Added as new contact", time: "15m ago" },
  { id: "4", type: "broadcast", label: "Flash Sale", description: "Broadcast sent to 1,240 contacts", time: "32m ago" },
  { id: "5", type: "system", label: "Webhook", description: "WhatsApp webhook reconnected", time: "1h ago" },
  { id: "6", type: "message", label: "Priya Patel", description: "Sent a message via WhatsApp", time: "1h ago" },
  { id: "7", type: "deal", label: "TechStart Deal", description: "Closed — won ($12,000)", time: "2h ago" },
  { id: "8", type: "contact", label: "Miguel Santos", description: "Added as new contact", time: "3h ago" },
];

const dotColors: Record<string, string> = {
  contact: "bg-blue-500",
  deal: "bg-emerald-500",
  message: "bg-primary",
  broadcast: "bg-orange-500",
  system: "bg-purple-500",
};

export function RecentActivity() {
  return (
    <div className="rounded-xl border bg-card p-4 md:p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Recent Activity</h3>
        <Button variant="link" size="sm" className="text-xs h-auto p-0">
          View all
        </Button>
      </div>
      <div className="flex-1 space-y-0 overflow-y-auto max-h-[320px]">
        {activities.map((a, i) => (
          <div
            key={a.id}
            className={cn(
              "flex gap-3 py-2.5",
              i < activities.length - 1 && "border-b border-dashed last:border-0"
            )}
          >
            <div className="flex flex-col items-center">
              <div className={cn("size-2 rounded-full mt-1.5 shrink-0", dotColors[a.type])} />
              {i < activities.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium truncate">{a.label}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{a.time}</span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">{a.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
