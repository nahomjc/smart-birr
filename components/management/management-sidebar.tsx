"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/managment",
    label: "Users",
    description: "Accounts & budgets",
    icon: UsersIcon,
    match: (path: string) =>
      path === "/managment" || path.startsWith("/managment/users"),
  },
  {
    href: "/managment/campaigns",
    label: "Campaigns",
    description: "Notify & email users",
    icon: CampaignIcon,
    match: (path: string) => path.startsWith("/managment/campaigns"),
  },
] as const;

function CampaignIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

export function ManagementSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-zinc-800/80 bg-[#080c0f] lg:w-64 lg:border-b-0 lg:border-r">
      <div className="border-b border-zinc-800/60 px-5 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500/90">
          Smart Birr
        </p>
        <h1 className="mt-1 text-lg font-semibold tracking-tight text-zinc-50">
          Management
        </h1>
        <p className="mt-1 text-xs text-zinc-500">Admin console</p>
      </div>

      <nav className="flex-1 space-y-1 p-3 lg:p-4">
        {navItems.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-start gap-3 rounded-xl px-3 py-3 transition ${
                active
                  ? "bg-amber-500/10 text-amber-100 ring-1 ring-amber-500/25"
                  : "text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200"
              }`}
            >
              <Icon
                className={`mt-0.5 h-5 w-5 shrink-0 ${
                  active ? "text-amber-400" : "text-zinc-500"
                }`}
              />
              <span>
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="mt-0.5 block text-xs opacity-70">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800/60 p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-900/80 hover:text-emerald-400"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to dashboard
        </Link>
      </div>
    </aside>
  );
}
