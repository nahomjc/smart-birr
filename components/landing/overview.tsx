"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardMockup } from "./dashboard-mockup";
import { landingContainer, TELEGRAM_BOT_HANDLE, TELEGRAM_BOT_URL } from "./constants";
import { TelegramBotFeature } from "./telegram-bot-feature";
import { fadeUp, staggerContainer, viewportOnce } from "./motion";
import { theme } from "@/lib/theme";

const bullets = [
  { id: "dashboard", text: "Unified dashboard for income, budgets, and expenses" },
  {
    id: "telegram",
    text: "Seamless Telegram bot — log spending in chat",
    href: TELEGRAM_BOT_URL,
    highlight: true,
  },
  { id: "auth", text: "Mobile-ready web app with Supabase auth" },
];

export function ProductOverview() {
  return (
    <section id="overview" className="py-20 lg:py-28">
      <article className={`${landingContainer} grid items-center gap-10 lg:grid-cols-2 lg:gap-12`}>
        <motion.header
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <motion.h2
            className={`text-3xl ${theme.heading}`}
            variants={fadeUp}
            transition={{ duration: 0.55 }}
          >
            Complete product overview
          </motion.h2>
          <motion.p
            className={`mt-3 ${theme.subtext}`}
            variants={fadeUp}
            transition={{ duration: 0.55, delay: 0.05 }}
          >
            Smart Birr combines AI counseling with practical ETB budgeting so
            you can save more and stress less.
          </motion.p>
          <motion.ul className="mt-8 space-y-4" variants={staggerContainer}>
            {bullets.map((item, i) => {
              const content = (
                <>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      item.highlight
                        ? "bg-[#2AABEE]/20 text-[#5bc8f5] ring-1 ring-[#2AABEE]/30"
                        : "bg-emerald-900/50 text-emerald-400"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className={item.highlight ? "text-zinc-100" : undefined}>
                    {item.text}
                    {item.highlight ? (
                      <span className="mt-0.5 block font-mono text-xs text-[#5bc8f5]">
                        {TELEGRAM_BOT_HANDLE}
                      </span>
                    ) : null}
                  </span>
                </>
              );

              return (
                <motion.li
                  key={item.id}
                  variants={fadeUp}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ x: 4 }}
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex gap-3 rounded-lg border border-transparent py-1 text-sm text-zinc-300 transition hover:border-[#2AABEE]/25 hover:bg-[#2AABEE]/5"
                    >
                      {content}
                    </a>
                  ) : (
                    <span className="flex gap-3 text-sm text-zinc-300">{content}</span>
                  )}
                </motion.li>
              );
            })}
          </motion.ul>
          <motion.div
            className="mt-8"
            variants={fadeUp}
            transition={{ delay: 0.25 }}
          >
            <TelegramBotFeature variant="pill" />
          </motion.div>
        </motion.header>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <DashboardMockup />
        </motion.div>
      </article>
    </section>
  );
}
