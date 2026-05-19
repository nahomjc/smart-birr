import Link from "next/link";
import { Logo } from "./logo";
import { landingContainer } from "./constants";
import { theme } from "@/lib/theme";

export function FooterCta() {
  return (
    <>
      <section className="relative overflow-hidden py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(16,185,129,0.12),transparent)]"
        />
        <article className={`${landingContainer} relative max-w-3xl text-center`}>
          <h2 className={`text-3xl sm:text-4xl ${theme.heading}`}>
            Ready to simplify your financial life?
          </h2>
          <p className={`mt-3 ${theme.subtext}`}>
            Start free with Smart Birr — budget in birr, track expenses, and chat
            with your AI counselor today.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex rounded-full bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-500"
          >
            Get started free
          </Link>
        </article>
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
