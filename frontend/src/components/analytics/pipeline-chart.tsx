"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const data = [
  { stage: "Qualification", value: 12000, color: "var(--color-chart-1)" },
  { stage: "Proposal", value: 18500, color: "var(--color-chart-2)" },
  { stage: "Negotiation", value: 10500, color: "var(--color-chart-3)" },
  { stage: "Closing", value: 7920, color: "var(--color-chart-4)" },
];

const total = data.reduce((s, d) => s + d.value, 0);

export function PipelineChart() {
  return (
    <div className="rounded-xl border bg-card p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Pipeline Value by Stage</h3>
        <span className="text-xs text-muted-foreground">
          Total: <strong className="text-foreground">${total.toLocaleString()}</strong>
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={90} />
            <Tooltip
              formatter={(value) => [`$${Number(value).toLocaleString()}`, "Value"]}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
