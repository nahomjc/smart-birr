"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, X, Maximize2 } from "lucide-react";
import { ChatPanel } from "@/components/chat/chat-panel";

export function FloatingAiChat() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isFullChatPage = pathname === "/dashboard/chat";

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (isFullChatPage) return null;

  return (
    <>
      {open && (
        <div
          id="floating-ai-chat-panel"
          role="dialog"
          aria-label="AI financial counselor"
          aria-modal="true"
          className="fixed bottom-[max(6rem,calc(3.75rem+2.25rem+env(safe-area-inset-bottom,0px)))] right-[max(1rem,env(safe-area-inset-right,0px))] z-[100] flex h-[min(70vh,560px)] w-[min(calc(100vw-2rem),400px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a1210]/80 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:right-6"
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-white/5 px-4 py-3.5 backdrop-blur-md">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 text-emerald-300 shadow-inner shadow-emerald-500/10">
                <Bot className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-zinc-50">
                  AI Counselor
                </p>
                <p className="truncate text-xs text-zinc-500">
                  Budget advice & expense logging
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <Link
                href="/dashboard/chat"
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-emerald-300"
                aria-label="Open full chat page"
                title="Open full page"
              >
                <Maximize2 className="h-4 w-4" strokeWidth={1.75} />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 border-t border-white/10">
            <ChatPanel embedded />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="floating-ai-chat-panel"
        className="group fixed bottom-[max(1.5rem,env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] z-[100] flex size-[3.75rem] items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-emerald-400/20 via-[#0f1714]/60 to-[#0a1210]/80 text-emerald-200 shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl transition duration-200 hover:border-emerald-400/35 hover:from-emerald-400/30 hover:text-emerald-100 hover:shadow-[0_12px_40px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400/80 sm:right-6"
        aria-label={open ? "Close AI counselor" : "Open AI counselor"}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl bg-emerald-500/0 transition group-hover:bg-emerald-500/5"
          aria-hidden
        />
        {open ? (
          <X className="relative h-5 w-5" strokeWidth={1.75} aria-hidden />
        ) : (
          <>
            <Bot className="relative h-6 w-6" strokeWidth={1.75} aria-hidden />
            <span
              className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0a1210]/90"
              aria-hidden
            />
          </>
        )}
      </button>
    </>
  );
}
