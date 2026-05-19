"use client";

import { Bot, FileText, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedBar } from "./animated-bar";

import { landingContainer } from "./constants";
import { fadeUp, scaleIn, staggerContainer, viewportOnce } from "./motion";
import { theme } from "@/lib/theme";

const trust = [
  { icon: Shield, label: "Bank-level Encryption" },
  { icon: Sparkles, label: "99.9% Uptime" },
  { icon: FileText, label: "ETB-first budgeting" },
];

const featureBars = [
  { id: "feat-w1", height: 35 },
  { id: "feat-w2", height: 55 },
  { id: "feat-w3", height: 40 },
  { id: "feat-w4", height: 70 },
  { id: "feat-w5", height: 50 },
  { id: "feat-w6", height: 85 },
  { id: "feat-w7", height: 65 },
] as const;

const card = theme.card;

export function Features() {
  return (
    <section id="features" className={`${theme.sectionAlt} py-20 lg:py-28`}>
      <article className={landingContainer}>
        <motion.header
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`text-3xl sm:text-4xl ${theme.heading}`}>
            Everything you need to manage money
          </h2>
          <p className={`mt-3 ${theme.subtext}`}>
            Powerful tools for budgeting, expense tracking, and AI counsel — on
            web and Telegram.
          </p>
        </motion.header>

        <motion.div
          className="mt-12 grid gap-4 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.article
            className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white shadow-xl shadow-emerald-950/50 lg:col-span-1 lg:row-span-2"
            variants={scaleIn}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <div>
              <p className="text-sm font-medium text-emerald-100">Real-time Analytics</p>
              <h3 className="mt-2 text-xl font-semibold">See where every birr goes</h3>
            </div>
            <motion.div
              className="mt-8 flex h-36 items-end gap-2"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              {featureBars.map((bar, i) => (
                <AnimatedBar
                  key={bar.id}
                  heightPercent={bar.height}
                  index={i}
                  className="rounded-t-lg bg-emerald-300/90"
                />
              ))}
            </motion.div>
          </motion.article>

          <motion.article
            className={card}
            variants={fadeUp}
            whileHover={{ y: -3 }}
          >
            <p className="text-sm font-semibold text-zinc-100">Secure Payments</p>
            <p className={`mt-1 text-xs ${theme.subtext}`}>Track spending safely</p>
            <motion.p
              className="mt-4 text-3xl font-bold text-emerald-400"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={viewportOnce}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              84<span className="text-lg text-zinc-500">/100</span>
            </motion.p>
            <p className="text-xs text-emerald-500">Security score</p>
          </motion.article>

          <motion.article className={card} variants={fadeUp} whileHover={{ y: -3 }}>
            <p className="text-sm font-semibold text-zinc-100">Smart Invoicing</p>
            <ul className={`mt-3 space-y-2 text-xs ${theme.subtext}`}>
              {[
                ["Lunch — Food", "500 ETB"],
                ["Taxi — Transport", "120 ETB"],
                ["Rent", "8,000 ETB"],
              ].map(([label, amount], i) => (
                <motion.li
                  key={label}
                  className="flex justify-between border-b border-emerald-900/20 pb-2 last:border-0"
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={viewportOnce}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <span>{label}</span>
                  <span className="font-medium text-zinc-200">{amount}</span>
                </motion.li>
              ))}
            </ul>
          </motion.article>

          <motion.article
            className={`${card} lg:col-span-2`}
            variants={fadeUp}
            whileHover={{ y: -2 }}
          >
            <motion.div
              className="flex items-start gap-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={viewportOnce}
            >
              <Bot className="h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-zinc-100">AI Fraud Guard</p>
                <motion.p
                  className="mt-2 rounded-lg border border-amber-900/40 bg-amber-950/40 px-3 py-2 text-xs text-amber-200/90"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewportOnce}
                  transition={{ delay: 0.25, duration: 0.5 }}
                >
                  System alert: Food spending is 18% over your monthly limit.
                </motion.p>
              </div>
            </motion.div>
          </motion.article>
        </motion.div>
      </article>
    </section>
  );
}

export function TrustBadges() {
  return (
    <section className="border-y border-emerald-900/30 bg-[#0a1210] py-10">
      <motion.ul
        className={`${landingContainer} flex flex-wrap items-center justify-center gap-8`}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {trust.map(({ icon: Icon, label }) => (
          <motion.li
            key={label}
            className={`flex items-center gap-2 text-sm font-medium ${theme.subtext}`}
            variants={fadeUp}
            whileHover={{ scale: 1.05, color: "rgb(212 212 216)" }}
          >
            <Icon className="h-5 w-5 text-emerald-500" />
            {label}
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
