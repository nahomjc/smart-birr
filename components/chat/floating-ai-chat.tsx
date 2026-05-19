"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Sparkles, X, Maximize2 } from "lucide-react";
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
    <div className="pointer-events-none fixed inset-0 z-[100]">
      {open && (
        <div
          id="floating-ai-chat-panel"
          role="dialog"
          aria-label="AI financial counselor"
          aria-modal="true"
          className="pointer-events-auto fixed bottom-24 right-4 flex w-[min(calc(100vw-2rem),400px)] flex-col overflow-hidden rounded-2xl border border-emerald-900/40 bg-[#0f1714] shadow-2xl shadow-black/60 sm:right-6"
          style={{ height: "min(70vh, 560px)" }}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-emerald-900/30 bg-[#0a1210] px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600/20 text-emerald-400">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-100">
                  AI Counselor
                </p>
                <p className="truncate text-xs text-zinc-500">
                  Budget advice & expense logging
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Link
                href="/dashboard/chat"
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-emerald-400"
                aria-label="Open full chat page"
                title="Open full page"
              >
                <Maximize2 className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1">
            <ChatPanel embedded />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="floating-ai-chat-panel"
        className="pointer-events-auto fixed bottom-6 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-950/50 transition hover:bg-emerald-500 hover:shadow-emerald-900/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 sm:right-6"
        aria-label={open ? "Close AI counselor" : "Open AI counselor"}
      >
        {open ? (
          <X className="h-6 w-6" aria-hidden />
        ) : (
          <MessageCircle className="h-6 w-6" aria-hidden />
        )}
      </button>
    </div>
  );
}
