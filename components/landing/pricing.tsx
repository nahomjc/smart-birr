"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { landingContainer } from "./constants";
import { theme } from "@/lib/theme";

const plans = [
  {
    name: "Starter",
    monthly: 0,
    annual: 0,
    desc: "Get started with AI chat and expense tracking.",
    features: ["AI counselor (limited)", "Monthly expense log", "Basic budget"],
    cta: "Start free",
    popular: false,
  },
  {
    name: "Pro",
    monthly: 299,
    annual: 249,
    desc: "Full budgeting, Telegram bot, and reports.",
    features: [
      "Unlimited AI counselor",
      "Telegram bot access",
      "Budget planner + charts",
      "Monthly AI reports",
    ],
    cta: "Start trial",
    popular: true,
  },
  {
    name: "Enterprise",
    monthly: null,
    annual: null,
    desc: "For teams and organizations in Ethiopia.",
    features: [
      "Custom integrations",
      "Dedicated support",
      "Multi-user accounts",
      "SLA & compliance",
    ],
    cta: "Contact us",
    popular: false,
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-20 lg:py-28">
      <article className={landingContainer}>
        <header className="text-center">
          <h2 className={`text-3xl sm:text-4xl ${theme.heading}`}>
            Simple, transparent pricing
          </h2>
          <p className={`mt-3 ${theme.subtext}`}>Plans in ETB for every stage.</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-900/40 bg-[#0f1714] p-1">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                !annual
                  ? "bg-emerald-600 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                annual
                  ? "bg-emerald-600 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Annually
            </button>
          </div>
        </header>

        <ul className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const price =
              plan.monthly == null
                ? "Custom"
                : plan.monthly === 0
                  ? "Free"
                  : `${annual ? plan.annual : plan.monthly} ETB`;
            const period =
              plan.monthly != null && plan.monthly > 0
                ? annual
                  ? "/mo billed yearly"
                  : "/month"
                : "";

            return (
              <li
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  plan.popular
                    ? "border-emerald-600/50 bg-gradient-to-b from-emerald-950/80 to-[#0f1714] shadow-lg shadow-emerald-950/30"
                    : theme.card
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-semibold text-white">
                    POPULAR
                  </span>
                )}
                <h3 className="text-lg font-semibold text-zinc-100">{plan.name}</h3>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-zinc-50">{price}</span>
                  {period && (
                    <span className={`text-sm ${theme.subtext}`}>{period}</span>
                  )}
                </p>
                <p className={`mt-2 text-sm ${theme.subtext}`}>{plan.desc}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex gap-2 text-sm ${theme.subtext}`}>
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`mt-8 block rounded-full py-2.5 text-center text-sm font-semibold transition ${
                    plan.popular
                      ? "bg-emerald-600 text-white hover:bg-emerald-500"
                      : "border border-emerald-800/50 bg-[#0a1210] text-zinc-100 hover:border-emerald-600/40"
                  }`}
                >
                  {plan.cta}
                </Link>
              </li>
            );
          })}
        </ul>
      </article>
    </section>
  );
}
