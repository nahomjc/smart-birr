"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = [
  "#059669",
  "#0d9488",
  "#0891b2",
  "#6366f1",
  "#a855f7",
  "#ec4899",
];

export function BudgetChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  if (!data.length) return null;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
          <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} />
          <Tooltip
            contentStyle={{
              background: "#0f1714",
              border: "1px solid rgba(52,211,153,0.2)",
              borderRadius: "12px",
              color: "#f4f4f5",
            }}
            formatter={(v) => [`${Number(v).toLocaleString()} ETB`, "Limit"]}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
