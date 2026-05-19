"use client";

import { useMemo, useState } from "react";
import { Clock, MoreHorizontal } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SpendingTimelineData, TimelinePoint } from "@/lib/data/spending-timeline";

function formatEtb(n: number): string {
  return `${n.toLocaleString("en-ET")} ETB`;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: TimelinePoint }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-violet-500/30 bg-[#12101a]/95 px-4 py-3 shadow-xl shadow-violet-950/40 backdrop-blur-sm">
      <p className="text-xs font-medium text-violet-300">{p.tooltipTitle}</p>
      <p className="mt-2 text-sm text-zinc-100">
        Spent: <span className="font-semibold text-violet-300">{formatEtb(p.spent)}</span>
      </p>
      <p className="mt-1 text-xs text-zinc-400">
        Budget guide: {formatEtb(p.budgetGuide)}
      </p>
    </div>
  );
}

type ViewMode = "day" | "month";

export function SpendingTimelineChart({ data }: { data: SpendingTimelineData }) {
  const [view, setView] = useState<ViewMode>("day");

  const series = view === "day" ? data.daySeries : data.monthSeries;
  const chartData = useMemo(
    () =>
      series.map((p) => ({
        ...p,
        label: p.label || "·",
      })),
    [series],
  );

  const maxY = useMemo(() => {
    const vals = series.flatMap((p) => [p.spent, p.budgetGuide]);
    const m = Math.max(...vals, 1);
    return Math.ceil(m * 1.15);
  }, [series]);

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-900/25 bg-gradient-to-br from-[#12101a] via-[#0f1714] to-[#0a1210] p-5 shadow-lg shadow-black/40 sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Clock className="h-4 w-4 text-violet-400" aria-hidden />
          <span>Timeline</span>
        </div>
        <button
          type="button"
          className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300"
          aria-label="More options"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
            Spending overview
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{data.periodLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="text-right">
            <p className="text-2xl font-semibold text-violet-300">
              {formatEtb(data.totalSpent)}
            </p>
            <p className="text-xs text-zinc-500">Spent this month</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-emerald-400">
              {data.remaining != null ? formatEtb(data.remaining) : "—"}
            </p>
            <p className="text-xs text-zinc-500">Remaining</p>
          </div>
          <div className="flex rounded-lg border border-white/10 bg-black/20 p-0.5">
            <button
              type="button"
              onClick={() => setView("day")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                view === "day"
                  ? "bg-violet-600/80 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setView("month")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                view === "month"
                  ? "bg-violet-600/80 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <p className="mt-8 text-center text-sm text-zinc-500">
          No spending data yet. Log expenses to see your timeline.
        </p>
      ) : (
        <div className="mt-6 h-64 w-full sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
            >
              <CartesianGrid
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, maxY]}
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  Number(v) >= 1000 ? `${Math.round(Number(v) / 1000)}k` : String(v)
                }
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="budgetGuide"
                name="Budget guide"
                stroke="rgba(52, 211, 153, 0.45)"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                activeDot={false}
              />
              <Line
                type="monotone"
                dataKey="spent"
                name="Spent"
                stroke="#a78bfa"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#c4b5fd",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 rounded bg-violet-400" />
          Spending
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 rounded border border-dashed border-emerald-400/60 bg-emerald-400/30" />
          {view === "day" ? "Daily budget pace" : "Monthly budget"}
        </span>
        {data.budgetTotal > 0 && (
          <span className="ml-auto text-zinc-400">
            Budget: {formatEtb(data.budgetTotal)}
          </span>
        )}
      </div>
    </section>
  );
}
