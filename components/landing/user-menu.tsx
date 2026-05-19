"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/actions/auth";

type Props = {
  displayName: string;
  email?: string | null;
  avatarUrl?: string | null;
};

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

export function LandingUserMenu({ displayName, email, avatarUrl }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const initials = initialsFrom(displayName);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-emerald-700/50 bg-emerald-950/80 ring-2 ring-transparent transition hover:border-emerald-500/60 hover:ring-emerald-500/20 focus:outline-none focus:ring-emerald-500/40"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={40}
            height={40}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : (
          <span className="text-sm font-semibold text-emerald-300">
            {initials}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-emerald-900/40 bg-[#0f1714] py-1 shadow-xl shadow-black/40"
        >
          <div className="border-b border-emerald-900/30 px-4 py-3">
            <p className="truncate text-sm font-medium text-zinc-100">
              {displayName}
            </p>
            {email && (
              <p className="truncate text-xs text-zinc-500">{email}</p>
            )}
          </div>
          <Link
            href="/dashboard"
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-zinc-200 transition hover:bg-emerald-950/50 hover:text-emerald-300"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <form action={signOut} className="border-t border-emerald-900/30">
            <button
              type="submit"
              role="menuitem"
              className="w-full px-4 py-2.5 text-left text-sm text-zinc-400 transition hover:bg-red-950/30 hover:text-red-300"
            >
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
