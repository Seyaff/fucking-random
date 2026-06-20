"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList, ReferenceLine } from "recharts";

const data = [
  { day: "Mon", seconds: 210 },
  { day: "Tue", seconds: 180 },
  { day: "Wed", seconds: 310 },
  { day: "Thu", seconds: 160 },
  { day: "Fri", seconds: 240 },
  { day: "Sat", seconds: 290 },
  { day: "Sun", seconds: 350 },
];

const TARGET_SECONDS = 300;

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export function FirstResponseTime() {
  return (
    <div className="rounded-xl border bg-card p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Avg. First Response Time</h3>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-amber-50 text-amber-700 rounded-full px-2 py-0.5">
          Target 5m
        </span>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 5, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="var(--muted-foreground)"
              tickFormatter={(v) => `${Math.floor(v / 60)}m`}
            />
            <ReferenceLine
              y={TARGET_SECONDS}
              stroke="var(--color-chart-3)"
              strokeDasharray="4 4"
              label={{
                value: "Target 5m",
                position: "right",
                fontSize: 10,
                fill: "var(--color-chart-3)",
              }}
            />
            <Bar dataKey="seconds" radius={[4, 4, 0, 0]} barSize={32} fill="var(--color-chart-1)">
              <LabelList
                dataKey="seconds"
                position="top"
                fontSize={9}
                fill="var(--muted-foreground)"
                formatter={(v) => formatTime(Number(v))}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
