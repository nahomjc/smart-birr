import { Bot, FileText, Shield, Sparkles } from "lucide-react";
import { landingContainer } from "./constants";
import { theme } from "@/lib/theme";

const trust = [
  { icon: Shield, label: "Bank-level Encryption" },
  { icon: Sparkles, label: "99.9% Uptime" },
  { icon: FileText, label: "ETB-first budgeting" },
];

const card = theme.card;

export function Features() {
  return (
    <section id="features" className={`${theme.sectionAlt} py-20 lg:py-28`}>
      <article className={landingContainer}>
        <header className="mx-auto max-w-2xl text-center">
          <h2 className={`text-3xl sm:text-4xl ${theme.heading}`}>
            Everything you need to manage money
          </h2>
          <p className={`mt-3 ${theme.subtext}`}>
            Powerful tools for budgeting, expense tracking, and AI counsel — on
            web and Telegram.
          </p>
        </header>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          <article className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white shadow-xl shadow-emerald-950/50 lg:col-span-1 lg:row-span-2">
            <div>
              <p className="text-sm font-medium text-emerald-100">Real-time Analytics</p>
              <h3 className="mt-2 text-xl font-semibold">See where every birr goes</h3>
            </div>
            <div className="mt-8 flex h-36 items-end gap-2">
              {[35, 55, 40, 70, 50, 85, 65].map((h, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-t-lg bg-emerald-300/90"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </article>

          <article className={card}>
            <p className="text-sm font-semibold text-zinc-100">Secure Payments</p>
            <p className={`mt-1 text-xs ${theme.subtext}`}>Track spending safely</p>
            <p className="mt-4 text-3xl font-bold text-emerald-400">
              84<span className="text-lg text-zinc-500">/100</span>
            </p>
            <p className="text-xs text-emerald-500">Security score</p>
          </article>

          <article className={card}>
            <p className="text-sm font-semibold text-zinc-100">Smart Invoicing</p>
            <ul className={`mt-3 space-y-2 text-xs ${theme.subtext}`}>
              <li className="flex justify-between border-b border-emerald-900/20 pb-2">
                <span>Lunch — Food</span>
                <span className="font-medium text-zinc-200">500 ETB</span>
              </li>
              <li className="flex justify-between border-b border-emerald-900/20 pb-2">
                <span>Taxi — Transport</span>
                <span className="font-medium text-zinc-200">120 ETB</span>
              </li>
              <li className="flex justify-between">
                <span>Rent</span>
                <span className="font-medium text-zinc-200">8,000 ETB</span>
              </li>
            </ul>
          </article>

          <article className={`${card} lg:col-span-2`}>
            <div className="flex items-start gap-3">
              <Bot className="h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-zinc-100">AI Fraud Guard</p>
                <p className="mt-2 rounded-lg border border-amber-900/40 bg-amber-950/40 px-3 py-2 text-xs text-amber-200/90">
                  System alert: Food spending is 18% over your monthly limit.
                </p>
              </div>
            </div>
          </article>
        </div>
      </article>
    </section>
  );
}

export function TrustBadges() {
  return (
    <section className="border-y border-emerald-900/30 bg-[#0a1210] py-10">
      <ul className={`${landingContainer} flex flex-wrap items-center justify-center gap-8`}>
        {trust.map(({ icon: Icon, label }) => (
          <li key={label} className={`flex items-center gap-2 text-sm font-medium ${theme.subtext}`}>
            <Icon className="h-5 w-5 text-emerald-500" />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
