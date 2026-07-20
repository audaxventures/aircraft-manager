"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCurrency } from "@/lib/format";

export interface MonthlyTrendPoint {
  month: string;
  fixed: number;
  direct: number;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-medium text-popover-foreground">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 text-muted-foreground">
          <span>{p.name}</span>
          <span className="tabular-nums text-popover-foreground">{formatCurrency(p.value, { noDecimals: true })}</span>
        </div>
      ))}
      <div className="mt-1 flex items-center justify-between gap-4 border-t pt-1 font-medium text-popover-foreground">
        <span>Total</span>
        <span className="tabular-nums">{formatCurrency(total, { noDecimals: true })}</span>
      </div>
    </div>
  );
}

function MonthlyTrendChart({ data }: { data: MonthlyTrendPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} barCategoryGap={12}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickFormatter={(v) => formatCurrency(v, { noDecimals: true })}
            width={64}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--secondary)" }} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
          />
          <Bar dataKey="fixed" name="Fixed" stackId="cost" fill="var(--chart-fixed)" radius={[0, 0, 0, 0]} maxBarSize={36} />
          <Bar dataKey="direct" name="Direct" stackId="cost" fill="var(--chart-direct)" radius={[4, 4, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export { MonthlyTrendChart };
