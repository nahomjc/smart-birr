import Link from "next/link";
import { DashboardNav } from "@/components/layout/nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getSupabaseUser } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getSupabaseUser();

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-emerald-700 dark:text-emerald-400"
          >
            Smart Birr
          </Link>
          <div className="flex items-center gap-4">
            {authUser?.email && (
              <span className="hidden text-sm text-zinc-500 sm:inline">
                {authUser.email}
              </span>
            )}
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
              Home
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <DashboardNav />
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
