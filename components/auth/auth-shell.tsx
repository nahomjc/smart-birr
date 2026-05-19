import Link from "next/link";
import { Logo } from "@/components/landing/logo";
import { AuthPromo } from "./auth-promo";

export function AuthShell({
  children,
  banner,
}: {
  children: React.ReactNode;
  banner?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative flex min-h-screen flex-col bg-[#071210] px-6 py-8 sm:px-10 lg:px-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_40%,rgba(52,211,153,0.18),transparent_70%)]"
        />
        <Logo className="relative z-10" />
        <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          {banner}
          {children}
        </div>
      </section>
      <AuthPromo />
    </div>
  );
}

export function AuthBackLink({ href, label }: { href: string; label: string }) {
  return (
    <p className="mt-8 text-center text-sm text-white/70">
      <Link
        href={href}
        className="font-medium text-white underline underline-offset-2 hover:text-emerald-300"
      >
        {label}
      </Link>
    </p>
  );
}
