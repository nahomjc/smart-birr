import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { getSupabaseUser } from "@/lib/auth/session";
import { Logo } from "./logo";
import { LandingUserMenu } from "./user-menu";
import { landingContainer } from "./constants";
import { theme } from "@/lib/theme";

const nav = [
  { label: "Home", href: "#home" },
  { label: "Products", href: "#features" },
  { label: "Solutions", href: "#overview" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#testimonials" },
];

function authDisplayName(user: User) {
  const meta = user.user_metadata ?? {};
  return (
    (meta.full_name as string) ||
    (meta.name as string) ||
    user.email?.split("@")[0] ||
    "User"
  );
}

function authAvatarUrl(user: User): string | null {
  const meta = user.user_metadata ?? {};
  const url =
    (meta.avatar_url as string) ||
    (meta.picture as string) ||
    null;
  return url && url.length > 0 ? url : null;
}

export async function LandingHeader() {
  const authUser = await getSupabaseUser();

  return (
    <header className={theme.header}>
      <div className={`${landingContainer} flex items-center justify-between py-4`}>
        <Logo light />
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link key={item.label} href={item.href} className={theme.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>
        {authUser ? (
          <LandingUserMenu
            displayName={authDisplayName(authUser)}
            email={authUser.email}
            avatarUrl={authAvatarUrl(authUser)}
          />
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500"
          >
            Log In
          </Link>
        )}
      </div>
    </header>
  );
}
