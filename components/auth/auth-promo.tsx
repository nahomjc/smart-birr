"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Sparkles } from "lucide-react";

const testimonials = [
  {
    quote:
      "Tracking spending in birr and getting a monthly budget took me ten minutes. Smart Birr just works.",
    name: "Sara Bekele",
    role: "Product Manager",
  },
  {
    quote:
      "I log expenses on Telegram like texting a friend. The AI counselor keeps me on track with savings.",
    name: "Daniel T.",
    role: "Software Engineer",
  },
  {
    quote:
      "Finally an app that understands Ethiopian income and rent — not generic dollar templates.",
    name: "Michael A.",
    role: "Small business owner",
  },
];

export function AuthPromo() {
  const [index, setIndex] = useState(0);
  const t = testimonials[index];

  return (
    <aside className="relative hidden min-h-full flex-col overflow-hidden rounded-l-[2.5rem] bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 text-white lg:flex lg:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-20 h-64 w-64 opacity-30"
        style={{
          background:
            "repeating-conic-gradient(from 0deg, transparent 0deg 8deg, rgba(255,255,255,0.35) 8deg 9deg)",
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col">
        <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
          What our users
          <br />
          are saying.
        </h2>

        <div className="mt-10 flex-1">
          <Quote className="h-8 w-8 text-white/80" fill="currentColor" />
          <p className="mt-4 max-w-md text-lg leading-relaxed text-white/95">
            {t.quote}
          </p>
          <p className="mt-6 font-semibold">{t.name}</p>
          <p className="text-sm text-white/75">{t.role}</p>
        </div>

        <div className="mt-8 flex gap-2">
          <button
            type="button"
            onClick={() =>
              setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 transition hover:bg-white/30"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % testimonials.length)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-800/50 transition hover:bg-emerald-800/70"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-8 rounded-2xl border border-white/10 bg-[#0a1210]/95 p-5 text-zinc-100 shadow-xl backdrop-blur-sm">
        <div className="absolute -right-1 -top-1 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <p className="pr-10 text-sm font-bold leading-snug sm:text-base">
          Get your budget right — track, save, and grow in ETB.
        </p>
        <p className="mt-2 text-xs text-zinc-400 sm:text-sm">
          Start free with AI counseling, expense tracking, and Telegram.
        </p>
        <div className="mt-4 flex -space-x-2">
          {["SB", "AB", "DT", "MK"].map((initials) => (
            <span
              key={initials}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0a1210] bg-gradient-to-br from-emerald-400 to-lime-500 text-[10px] font-bold text-white"
            >
              {initials}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
