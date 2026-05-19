/** macOS-style window controls (traffic lights) */
export function WindowChrome({ title = "Dashboard" }: { title?: string }) {
  return (
    <div
      className="flex items-center gap-3 border-b border-emerald-900/30 bg-[#0a1210]/95 px-4 py-2.5 sm:px-5"
      aria-hidden
    >
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]"
          title="Close"
        />
        <span
          className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
          title="Minimize"
        />
        <span
          className="h-3 w-3 rounded-full bg-[#28c840] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
          title="Maximize"
        />
      </div>
      <p className="flex-1 truncate text-center text-xs font-medium text-zinc-500">
        {title}
      </p>
      <div className="w-[52px] shrink-0" aria-hidden />
    </div>
  );
}
