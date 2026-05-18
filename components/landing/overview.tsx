import { Check } from "lucide-react";
import { DashboardMockup } from "./dashboard-mockup";
import { landingContainer } from "./constants";
import { theme } from "@/lib/theme";

const bullets = [
  "Unified dashboard for income, budgets, and expenses",
  "Seamless Telegram bot — log spending in chat",
  "Mobile-ready web app with Supabase auth",
];

export function ProductOverview() {
  return (
    <section id="overview" className="py-20 lg:py-28">
      <article className={`${landingContainer} grid items-center gap-10 lg:grid-cols-2 lg:gap-12`}>
        <header>
          <h2 className={`text-3xl ${theme.heading}`}>Complete product overview</h2>
          <p className={`mt-3 ${theme.subtext}`}>
            Smart Birr combines AI counseling with practical ETB budgeting so
            you can save more and stress less.
          </p>
          <ul className="mt-8 space-y-4">
            {bullets.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-zinc-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-900/50 text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </header>
        <DashboardMockup />
      </article>
    </section>
  );
}
