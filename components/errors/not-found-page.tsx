import Link from "next/link";
import { Logo } from "@/components/landing/logo";
import { theme } from "@/lib/theme";

type Props = {
  isSignedIn: boolean;
};

export function NotFoundPage({ isSignedIn }: Props) {
  const primaryHref = isSignedIn ? "/dashboard" : "/";
  const primaryLabel = isSignedIn ? "Go to dashboard" : "Back to home";

  return (
    <div
      className={`${theme.page} relative flex min-h-screen flex-col overflow-hidden`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-5%,rgba(16,185,129,0.22),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_85%_90%,rgba(245,158,11,0.08),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(52,211,153,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <header className="relative z-10 border-b border-emerald-900/25 bg-[#060d0b]/80 px-4 py-4 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo />
          <Link href="/login" className={`${theme.navLink} text-sm`}>
            Sign in
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16 sm:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <p className="font-mono text-sm font-medium tracking-[0.2em] text-emerald-500/90 uppercase">
              Error 404
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
              This page isn&apos;t in your budget
            </h1>
            <p className={`${theme.subtext} mx-auto mt-4 max-w-md text-base leading-relaxed lg:mx-0`}>
              The link may be broken, outdated, or you may have mistyped the
              URL. Head back to Smart Birr to track expenses and manage your
              finances in ETB.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href={primaryHref}
                className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-500 sm:w-auto"
              >
                {primaryLabel}
              </Link>
              {isSignedIn ? (
                <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-900/40 bg-[#0f1714]/90 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-emerald-600/40 hover:text-emerald-300 sm:w-auto"
                >
                  Marketing site
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-900/40 bg-[#0f1714]/90 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-emerald-600/40 hover:text-emerald-300 sm:w-auto"
                >
                  Log in
                </Link>
              )}
            </div>

            {isSignedIn && (
              <p className="mt-10 text-xs text-zinc-600">
                Need help?{" "}
                <Link
                  href="/dashboard/chat"
                  className="text-emerald-500/90 underline-offset-2 hover:text-emerald-400 hover:underline"
                >
                  Ask the AI counselor
                </Link>
              </p>
            )}
          </div>

          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative w-full max-w-md">
              <div
                aria-hidden
                className="absolute -inset-4 rounded-4xl bg-emerald-500/10 blur-2xl"
              />
              <div className="relative overflow-hidden rounded-2xl border border-emerald-900/30 bg-[#0f1714]/95 p-8 shadow-2xl shadow-black/50 sm:p-10">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-7xl font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-emerald-300 via-emerald-500 to-amber-500/80 sm:text-8xl">
                    404
                  </span>
                  <NotFoundIllustration className="h-20 w-20 shrink-0 text-emerald-500/40 sm:h-24 sm:w-24" />
                </div>
                <div className="mt-8 space-y-3 border-t border-emerald-900/25 pt-6">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Route status</span>
                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 font-medium text-red-300/90">
                      Not found
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Currency</span>
                    <span className="font-mono text-emerald-400/90">ETB</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
                    <div className="h-full w-[38%] rounded-full bg-linear-to-r from-emerald-600 to-amber-500/70" />
                  </div>
                  <p className="text-[11px] text-zinc-600">
                    Balance of patience: holding steady
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-emerald-900/20 px-4 py-6 text-center text-xs text-zinc-600 sm:px-8">
        © {new Date().getFullYear()} Smart Birr · Personal finance for Ethiopia
      </footer>
    </div>
  );
}

function NotFoundIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="48" cy="48" r="28" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
      <path
        d="M48 20v12M48 64v12M20 48h12M64 48h12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M48 36c-6.627 0-12 5.373-12 12s5.373 12 12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="48" cy="48" r="4" fill="currentColor" fillOpacity="0.5" />
      <path
        d="M62 58l14 14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
