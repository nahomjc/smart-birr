"use client";

import {
  BarChart3,
  Bell,
  LayoutGrid,
  Search,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedBar } from "./animated-bar";
import { WindowChrome } from "./window-chrome";
import {
  fadeUp,
  scaleIn,
  staggerContainer,
  springSoft,
  viewportOnce,
} from "./motion";

const metrics = [
  { label: "Total Spending (Month)", value: "42,800 ETB", change: "+2.5%", up: true },
  { label: "Savings Goal", value: "8,400 ETB", change: "+12%", up: true },
  { label: "Budget Remaining", value: "17,200 ETB", change: "-4%", up: false },
];

const spendingBars = [
  { id: "spend-w1", height: 40 },
  { id: "spend-w2", height: 65 },
  { id: "spend-w3", height: 45 },
  { id: "spend-w4", height: 80 },
  { id: "spend-w5", height: 55 },
  { id: "spend-w6", height: 90 },
  { id: "spend-w7", height: 70 },
  { id: "spend-w8", height: 85 },
] as const;

const categories: [string, number][] = [
  ["Food", 72],
  ["Transport", 48],
  ["Rent", 90],
];

export function DashboardMockup() {
  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-emerald-900/40 bg-[#0f1714] shadow-2xl shadow-black/50 ring-1 ring-emerald-900/20"
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={viewportOnce}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <WindowChrome title="Smart Birr — Dashboard" />
      <motion.div
        className="flex bg-[#0a1210]"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <div className="hidden w-14 shrink-0 flex-col gap-3 border-r border-emerald-900/30 p-3 sm:flex">
          <LayoutGrid className="h-5 w-5 text-emerald-500" />
          <BarChart3 className="h-5 w-5 text-zinc-600" />
          <Wallet className="h-5 w-5 text-zinc-600" />
          <Users className="h-5 w-5 text-zinc-600" />
          <Settings className="h-5 w-5 text-zinc-600" />
        </div>
        <motion.div className="min-w-0 flex-1 p-4 sm:p-5">
          <motion.div
            className="flex flex-wrap items-center justify-between gap-3"
            variants={fadeUp}
            transition={springSoft}
          >
            <motion.div variants={fadeUp} transition={springSoft}>
              <p className="text-xs font-medium text-zinc-500">Overview</p>
              <p className="text-sm font-semibold text-zinc-100">Financial snapshot</p>
            </motion.div>
            <motion.div
              className="flex items-center gap-2"
              variants={fadeUp}
              transition={springSoft}
            >
              <motion.div
                className="hidden items-center gap-1 rounded-lg border border-emerald-900/30 bg-[#141f1b] px-2 py-1 text-xs text-zinc-500 sm:flex"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <span className="rounded bg-emerald-600 px-2 py-0.5 text-white">7D</span>
                <span className="px-2">30D</span>
                <span className="px-2">3M</span>
              </motion.div>
              <motion.div
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-900/30 bg-[#141f1b]"
                whileHover={{ scale: 1.08, borderColor: "rgba(16,185,129,0.4)" }}
              >
                <Search className="h-4 w-4 text-zinc-500" />
              </motion.div>
              <motion.div
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-900/30 bg-[#141f1b]"
                whileHover={{ scale: 1.08, borderColor: "rgba(16,185,129,0.4)" }}
              >
                <Bell className="h-4 w-4 text-zinc-500" />
              </motion.div>
              <motion.button
                type="button"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                whileHover={{ scale: 1.05, backgroundColor: "#059669" }}
                whileTap={{ scale: 0.98 }}
              >
                Export
              </motion.button>
            </motion.div>
          </motion.div>
          <motion.div
            className="mt-4 grid gap-3 sm:grid-cols-3"
            variants={staggerContainer}
          >
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                className="rounded-xl border border-emerald-900/25 bg-[#141f1b] p-3"
                variants={fadeUp}
                transition={{ ...springSoft, delay: i * 0.08 }}
                whileHover={{ y: -2, borderColor: "rgba(16,185,129,0.35)" }}
              >
                <p className="text-[10px] font-medium text-zinc-500 sm:text-xs">{m.label}</p>
                <motion.p
                  className="mt-1 text-sm font-bold text-zinc-100 sm:text-base"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={viewportOnce}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                >
                  {m.value}
                </motion.p>
                <p
                  className={`mt-0.5 text-xs font-medium ${m.up ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {m.change}
                </p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="mt-4 grid gap-3 lg:grid-cols-2"
            variants={staggerContainer}
          >
            <motion.div
              className="rounded-xl border border-emerald-900/25 bg-[#141f1b] p-4"
              variants={scaleIn}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-medium text-zinc-400">Spending overview</p>
              <motion.div
                className="mt-3 flex h-24 items-end gap-1.5"
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
              >
                {spendingBars.map((bar, i) => (
                  <AnimatedBar
                    key={bar.id}
                    heightPercent={bar.height}
                    index={i}
                    className="bg-gradient-to-t from-emerald-600 to-emerald-400"
                  />
                ))}
              </motion.div>
            </motion.div>
            <motion.div
              className="rounded-xl border border-emerald-900/25 bg-[#141f1b] p-4"
              variants={scaleIn}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p className="text-xs font-medium text-zinc-400">Category breakdown</p>
              <div className="mt-3 space-y-2">
                {categories.map(([label, w], i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={viewportOnce}
                    transition={{ delay: 0.2 + i * 0.12, duration: 0.45 }}
                  >
                    <motion.div
                      className="flex justify-between text-[10px] text-zinc-500"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={viewportOnce}
                      transition={{ delay: 0.35 + i * 0.12 }}
                    >
                      <span>{label}</span>
                    </motion.div>
                    <motion.div className="mt-1 h-2 overflow-hidden rounded-full bg-[#0a1210]">
                      <motion.span
                        className="block h-full rounded-full bg-emerald-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${w}%` }}
                        viewport={viewportOnce}
                        transition={{
                          duration: 1,
                          delay: 0.35 + i * 0.15,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
