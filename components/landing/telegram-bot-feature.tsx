"use client";

import { ArrowUpRight, MessageCircle, Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import {
  TELEGRAM_BOT_HANDLE,
  TELEGRAM_BOT_URL,
  TELEGRAM_BOT_USERNAME,
} from "./constants";
import { fadeUp, viewportOnce } from "./motion";

const chatPreview = [
  { role: "user" as const, text: "Spent 350 birr on lunch" },
  { role: "bot" as const, text: "Logged · Food · 350 ETB ✓" },
  { role: "bot" as const, text: "You're at 68% of your food budget." },
];

type TelegramBotFeatureProps = {
  variant?: "card" | "banner" | "pill";
  className?: string;
};

export function TelegramBotFeature({
  variant = "card",
  className = "",
}: TelegramBotFeatureProps) {
  if (variant === "pill") {
    return (
      <motion.a
        href={TELEGRAM_BOT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`group inline-flex items-center gap-2.5 rounded-full border border-[#2AABEE]/40 bg-[#0f1714]/90 px-5 py-2.5 text-sm font-semibold text-zinc-100 shadow-lg shadow-[#2AABEE]/10 backdrop-blur-sm transition hover:border-[#2AABEE]/70 hover:bg-[#141f1b] hover:shadow-[#2AABEE]/25 ${className}`}
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2AABEE]/20 text-[#5bc8f5] ring-1 ring-[#2AABEE]/30 transition group-hover:bg-[#2AABEE]/30">
          <Send className="h-4 w-4" />
        </span>
        Check out our Telegram bot
        <ArrowUpRight className="h-4 w-4 text-[#5bc8f5] opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
      </motion.a>
    );
  }

  if (variant === "banner") {
    return (
      <motion.a
        href={TELEGRAM_BOT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`group relative block overflow-hidden rounded-2xl border border-[#2AABEE]/25 bg-[#0a1210] p-6 sm:p-8 ${className}`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -4 }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#2AABEE]/15 blur-3xl transition duration-500 group-hover:bg-[#2AABEE]/25"
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(42,171,238,0.08)_50%,transparent_60%)]"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2AABEE]/30 bg-[#2AABEE]/10 px-3 py-1 text-xs font-medium text-[#7dd3fc]">
              <Sparkles className="h-3.5 w-3.5" />
              Live on Telegram
            </span>
            <h3 className="mt-4 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
              Check out our Telegram bot
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400 sm:text-base">
              Log expenses in chat, get AI budget coaching, and receive alerts —
              without opening the dashboard.
            </p>
            <p className="mt-4 font-mono text-sm text-[#5bc8f5]">
              {TELEGRAM_BOT_HANDLE}
            </p>
          </div>
          <ChatPreview className="w-full max-w-sm shrink-0 lg:max-w-xs" />
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#2AABEE] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#2AABEE]/30 transition group-hover:bg-[#229ED9] lg:self-center">
            Open in Telegram
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </motion.a>
    );
  }

  return (
    <motion.a
      href={TELEGRAM_BOT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#2AABEE]/20 bg-gradient-to-br from-[#0f1714] via-[#0a1210] to-[#071510] p-5 shadow-xl shadow-black/40 ring-1 ring-[#2AABEE]/10 transition hover:border-[#2AABEE]/45 hover:shadow-[#2AABEE]/15 sm:p-6 ${className}`}
      variants={fadeUp}
      whileHover={{ y: -4, scale: 1.005 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#2AABEE]/20 blur-2xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 0%), rgba(42,171,238,0.08), transparent 40%)",
        }}
      />

      <motion.div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#2AABEE] to-[#229ED9] shadow-lg shadow-[#2AABEE]/30">
            <MessageCircle className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">Telegram Bot</p>
            <p className="text-xs text-zinc-500">AI expense tracking in chat</p>
          </div>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-900/30 bg-[#141f1b]/80 text-zinc-500 transition group-hover:border-[#2AABEE]/40 group-hover:text-[#5bc8f5]">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </motion.div>

      <p className="relative mt-4 text-sm leading-relaxed text-zinc-400">
        <span className="font-medium text-zinc-200">
          Check out our Telegram bot
        </span>{" "}
        — message {TELEGRAM_BOT_HANDLE} to log spending, run /budget, and get
        nightly ETB summaries.
      </p>

      <ChatPreview className="relative mt-4 flex-1" />

      <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-emerald-900/25 pt-4">
        <code className="rounded-md bg-[#141f1b] px-2 py-1 font-mono text-xs text-[#5bc8f5]">
          {TELEGRAM_BOT_USERNAME}
        </code>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5bc8f5] transition group-hover:gap-2">
          Open bot
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </motion.a>
  );
}

function ChatPreview({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-emerald-900/30 bg-[#0a1210]/80 p-3 backdrop-blur-sm ${className}`}
    >
      <motion.div
        className="mb-2 flex items-center gap-2 border-b border-emerald-900/20 pb-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewportOnce}
      >
        <span className="h-2 w-2 rounded-full bg-[#2AABEE]" />
        <span className="text-[10px] font-medium text-zinc-500">
          Smart Birr Bot
        </span>
      </motion.div>
      <ul className="space-y-2">
        {chatPreview.map((msg, i) => (
          <motion.li
            key={msg.text}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={viewportOnce}
            transition={{ delay: 0.15 + i * 0.12, duration: 0.4 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-[10px] leading-snug sm:text-xs ${
                msg.role === "user"
                  ? "bg-[#2AABEE]/90 text-white"
                  : "border border-emerald-900/30 bg-[#141f1b] text-zinc-300"
              }`}
            >
              {msg.text}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
