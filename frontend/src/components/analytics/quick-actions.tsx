"use client";

import { Button } from "@/components/ui/button";
import { UserPlus, DollarSign, Megaphone, Zap } from "lucide-react";

const actions = [
  { label: "New Contact", icon: UserPlus, color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20" },
  { label: "New Deal", icon: DollarSign, color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" },
  { label: "New Broadcast", icon: Megaphone, color: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20" },
  { label: "New Automation", icon: Zap, color: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map(({ label, icon: Icon, color }) => (
        <Button
          key={label}
          variant="outline"
          className={`h-auto flex-col gap-1.5 py-4 border-dashed ${color}`}
        >
          <Icon className="size-5" />
          <span className="text-xs font-medium">{label}</span>
        </Button>
      ))}
    </div>
  );
}
