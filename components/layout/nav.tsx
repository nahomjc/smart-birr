"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { theme } from "@/lib/theme";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/chat", label: "AI Counselor" },
  { href: "/dashboard/expenses", label: "Expenses" },
  { href: "/dashboard/budget", label: "Budget" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 border-b border-emerald-900/30 pb-4">
      {links.map((link) => {
        const active =
          pathname === link.href ||
          (link.href !== "/dashboard" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? theme.navActive : theme.navIdle}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
