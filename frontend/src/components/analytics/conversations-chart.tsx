"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const ranges = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const;

const data7d = [
  { day: "Mon", incoming: 180, outgoing: 240 },
  { day: "Tue", incoming: 220, outgoing: 280 },
  { day: "Wed", incoming: 260, outgoing: 310 },
  { day: "Thu", incoming: 240, outgoing: 290 },
  { day: "Fri", incoming: 290, outgoing: 350 },
  { day: "Sat", incoming: 200, outgoing: 220 },
  { day: "Sun", incoming: 150, outgoing: 180 },
];

const data30d = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  incoming: Math.floor(Math.random() * 200 + 150),
  outgoing: Math.floor(Math.random() * 200 + 200),
}));

const data90d = Array.from({ length: 90 }, (_, i) => ({
  day: `Day ${i + 1}`,
  incoming: Math.floor(Math.random() * 200 + 150),
  outgoing: Math.floor(Math.random() * 200 + 200),
}));

const dataMap = { 7: data7d, 30: data30d, 90: data90d };

export function ConversationsChart() {
  const [range, setRange] = useState<number>(7);
  const data = dataMap[range as keyof typeof dataMap];

  return (
    <div className="rounded-xl border bg-card p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Conversations Over Time</h3>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          {ranges.map((r) => (
            <button
              key={r.days}
              onClick={() => setRange(r.days)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                range === r.days ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incoming" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outgoing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: 12,
              }}
            />
            <Legend
              formatter={(value) => <span className="text-xs capitalize">{value}</span>}
            />
            <Area type="monotone" dataKey="incoming" stroke="var(--color-chart-1)" fill="url(#incoming)" strokeWidth={2} />
            <Area type="monotone" dataKey="outgoing" stroke="var(--color-chart-2)" fill="url(#outgoing)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
