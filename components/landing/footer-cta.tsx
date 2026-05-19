"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "./logo";
import { landingContainer } from "./constants";
import { fadeUp, viewportOnce } from "./motion";
import { theme } from "@/lib/theme";

export function FooterCta() {
  return (
    <>
      <section className="relative overflow-hidden py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(16,185,129,0.12),transparent)]"
        />
        <motion.article
          className={`${landingContainer} relative max-w-3xl text-center`}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          <motion.h2
            className={`text-3xl sm:text-4xl ${theme.heading}`}
            variants={fadeUp}
          >
            Ready to simplify your financial life?
          </motion.h2>
          <motion.p className={`mt-3 ${theme.subtext}`} variants={fadeUp}>
            Start free with Smart Birr — budget in birr, track expenses, and chat
            with your AI counselor today.
          </motion.p>
          <motion.div variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/login"
              className="mt-8 inline-flex rounded-full bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-500"
            >
              Get started free
            </Link>
          </motion.div>
        </motion.article>
      </section>

      <footer className="border-t border-emerald-900/30 bg-[#0a1210] py-10">
        <article
          className={`${landingContainer} flex flex-col items-center justify-between gap-6 sm:flex-row`}
        >
          <Logo size="footer" />
          <p className={`text-sm ${theme.subtext}`}>
            © {new Date().getFullYear()} Smart Birr. Built for Ethiopia.
          </p>
          <nav className={`flex gap-6 text-sm ${theme.subtext}`}>
            <Link href="/login" className="hover:text-emerald-400">
              Log in
            </Link>
            <Link href="#pricing" className="hover:text-emerald-400">
              Pricing
            </Link>
            <Link href="/dashboard" className="hover:text-emerald-400">
              Dashboard
            </Link>
          </nav>
        </article>
      </footer>
    </>
  );
}
