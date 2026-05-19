/** Shared dark + emerald theme tokens */
export const theme = {
  page: "min-h-full bg-[#060d0b] text-zinc-100",
  sectionAlt: "bg-[#0a1210]",
  header:
    "sticky top-0 z-50 border-b border-emerald-900/30 bg-[#060d0b]/90 backdrop-blur-xl",
  card: "rounded-2xl border border-emerald-900/25 bg-[#0f1714]/90 p-6 shadow-lg shadow-black/30",
  cardHover:
    "rounded-2xl border border-emerald-900/25 bg-[#0f1714]/90 p-6 shadow-lg shadow-black/30 transition hover:border-emerald-500/40",
  heading: "font-bold tracking-tight text-zinc-50",
  subtext: "text-zinc-400",
  input:
    "w-full rounded-xl border border-emerald-900/30 bg-[#0a1210] px-4 py-2.5 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30",
  navLink: "text-sm font-medium text-zinc-400 transition hover:text-emerald-400",
  navActive: "rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white",
  navIdle:
    "rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-emerald-950/50 hover:text-emerald-300",
  /** Dashboard shell — full width with comfortable side padding */
  dashboardShell: "w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-14",
} as const;
