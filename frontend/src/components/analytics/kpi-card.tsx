"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  delta: number;
  icon: React.ReactNode;
}

export function KpiCard({ title, value, delta, icon }: KpiCardProps) {
  const isUp = delta >= 0;

  return (
    <div className="rounded-xl border bg-card p-4 md:p-5 flex flex-col gap-2 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-medium rounded-full px-1.5 py-0.5",
            isUp ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
          )}
        >
          {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {Math.abs(delta).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
