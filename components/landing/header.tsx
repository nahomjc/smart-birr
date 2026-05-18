import Link from "next/link";
import { Logo } from "./logo";
import { landingContainer } from "./constants";
import { theme } from "@/lib/theme";

const nav = [
  { label: "Home", href: "#home" },
  { label: "Products", href: "#features" },
  { label: "Solutions", href: "#overview" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#testimonials" },
];

export function LandingHeader() {
  return (
    <header className={theme.header}>
      <div className={`${landingContainer} flex items-center justify-between py-4`}>
        <Link href="/">
          <Logo light />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link key={item.label} href={item.href} className={theme.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/login"
          className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500"
        >
          Log In
        </Link>
      </div>
    </header>
  );
}
