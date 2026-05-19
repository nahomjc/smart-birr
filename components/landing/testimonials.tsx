"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { landingContainer } from "./constants";
import { fadeUp, staggerContainer, viewportOnce } from "./motion";
import { theme } from "@/lib/theme";

const starSlots = ["star-1", "star-2", "star-3", "star-4", "star-5"] as const;

const reviews = [
  {
    quote:
      "Smart Birr helped me understand my spending in birr and hit my savings goal for the first time.",
    name: "Michael Chen",
    role: "Founder, Addis Startup",
  },
  {
    quote:
      "Logging expenses on Telegram is genius. I just message what I spent and the AI handles the rest.",
    name: "Sara Bekele",
    role: "Product Manager",
  },
  {
    quote:
      "The budget planner split my 20k income into rent, food, and savings — finally something realistic.",
    name: "Daniel T.",
    role: "Freelance developer",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className={`${theme.sectionAlt} py-20 lg:py-28`}>
      <article className={landingContainer}>
        <motion.header
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`text-3xl sm:text-4xl ${theme.heading}`}>
            Loved by people managing money in ETB
          </h2>
          <p className={`mt-3 ${theme.subtext}`}>
            Join users who budget smarter with AI and Telegram.
          </p>
        </motion.header>
        <motion.ul
          className="mt-12 grid gap-6 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {reviews.map((r) => (
            <motion.li
              key={r.name}
              className={theme.card}
              variants={fadeUp}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 25 } }}
            >
              <motion.p
                className="flex gap-0.5 text-amber-400"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={viewportOnce}
                transition={{ staggerChildren: 0.05 }}
              >
                {starSlots.map((starId, i) => (
                  <motion.span
                    key={starId}
                    initial={{ scale: 0, rotate: -30 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={viewportOnce}
                    transition={{ delay: i * 0.06, type: "spring", stiffness: 400 }}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </motion.span>
                ))}
              </motion.p>
              <blockquote className="mt-4 text-sm leading-relaxed text-zinc-300">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <footer className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-600 text-sm font-semibold text-white">
                  {r.name[0]}
                </span>
                <span>
                  <p className="text-sm font-semibold text-zinc-100">{r.name}</p>
                  <p className={`text-xs ${theme.subtext}`}>{r.role}</p>
                </span>
              </footer>
            </motion.li>
          ))}
        </motion.ul>
      </article>
    </section>
  );
}
