import Link from "next/link";
import { DashboardMockup } from "./dashboard-mockup";
import { landingContainer } from "./constants";
import { theme } from "@/lib/theme";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.15),transparent),radial-gradient(ellipse_60%_40%_at_80%_20%,rgba(52,211,153,0.08),transparent)]"
      />
      <div className={`${landingContainer} max-w-5xl text-center`}>
        <h1 className={`text-4xl sm:text-5xl lg:text-6xl ${theme.heading}`}>
          Smart Financial Management
        </h1>
        <p className={`mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg ${theme.subtext}`}>
          Experience the future of personal finance with our secure AI-driven
          platform — built for Ethiopian Birr, budgeting, and everyday savings.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-full bg-emerald-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-500"
          >
            Start Free Trial
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-emerald-700/50 bg-[#0f1714] px-7 py-3 text-sm font-semibold text-emerald-400 transition hover:border-emerald-500/50 hover:bg-emerald-950/50"
          >
            Join Now
          </Link>
        </div>
      </div>
      <div className={`${landingContainer} relative mt-14 lg:mt-16`}>
        <div className="absolute inset-x-2 -bottom-6 top-8 -z-10 rounded-3xl bg-gradient-to-b from-emerald-900/30 via-transparent to-transparent blur-2xl sm:inset-x-4" />
        <DashboardMockup />
      </div>
    </section>
  );
}
