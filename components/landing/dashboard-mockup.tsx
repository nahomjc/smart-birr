import {
  BarChart3,
  Bell,
  LayoutGrid,
  Search,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

const metrics = [
  { label: "Total Spending (Month)", value: "42,800 ETB", change: "+2.5%", up: true },
  { label: "Savings Goal", value: "8,400 ETB", change: "+12%", up: true },
  { label: "Budget Remaining", value: "17,200 ETB", change: "-4%", up: false },
];

export function DashboardMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-900/40 bg-[#0f1714] shadow-2xl shadow-black/50 ring-1 ring-emerald-900/20">
      <div className="flex border-b border-emerald-900/30 bg-[#0a1210]">
        <div className="hidden w-14 shrink-0 flex-col gap-3 border-r border-emerald-900/30 p-3 sm:flex">
          <LayoutGrid className="h-5 w-5 text-emerald-500" />
          <BarChart3 className="h-5 w-5 text-zinc-600" />
          <Wallet className="h-5 w-5 text-zinc-600" />
          <Users className="h-5 w-5 text-zinc-600" />
          <Settings className="h-5 w-5 text-zinc-600" />
        </div>
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-zinc-500">Overview</p>
              <p className="text-sm font-semibold text-zinc-100">Financial snapshot</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1 rounded-lg border border-emerald-900/30 bg-[#141f1b] px-2 py-1 text-xs text-zinc-500 sm:flex">
                <span className="rounded bg-emerald-600 px-2 py-0.5 text-white">7D</span>
                <span className="px-2">30D</span>
                <span className="px-2">3M</span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-900/30 bg-[#141f1b]">
                <Search className="h-4 w-4 text-zinc-500" />
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-900/30 bg-[#141f1b]">
                <Bell className="h-4 w-4 text-zinc-500" />
              </div>
              <button
                type="button"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
              >
                Export
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-emerald-900/25 bg-[#141f1b] p-3"
              >
                <p className="text-[10px] font-medium text-zinc-500 sm:text-xs">{m.label}</p>
                <p className="mt-1 text-sm font-bold text-zinc-100 sm:text-base">{m.value}</p>
                <p
                  className={`mt-0.5 text-xs font-medium ${m.up ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {m.change}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-emerald-900/25 bg-[#141f1b] p-4">
              <p className="text-xs font-medium text-zinc-400">Spending overview</p>
              <div className="mt-3 flex h-24 items-end gap-1.5">
                {[40, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-emerald-900/25 bg-[#141f1b] p-4">
              <p className="text-xs font-medium text-zinc-400">Category breakdown</p>
              <div className="mt-3 space-y-2">
                {[
                  ["Food", 72],
                  ["Transport", 48],
                  ["Rent", 90],
                ].map(([label, w]) => (
                  <div key={String(label)}>
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span>{label}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#0a1210]">
                      <span
                        className="block h-full rounded-full bg-emerald-500"
                        style={{ width: `${w}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
