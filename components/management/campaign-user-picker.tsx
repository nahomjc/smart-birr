"use client";

import { useMemo, useState } from "react";
import type { CampaignPickerUser } from "@/lib/campaigns/campaign-service";
import { theme } from "@/lib/theme";

type ListFilter = "all" | "has_email" | "no_email";

type Props = {
  users: CampaignPickerUser[];
  selectedIds: Set<string>;
  onChange: (ids: Set<string>) => void;
};

export function CampaignUserPicker({ users, selectedIds, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [listFilter, setListFilter] = useState<ListFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const hasEmail = !!u.email?.trim();
      if (listFilter === "has_email" && !hasEmail) return false;
      if (listFilter === "no_email" && hasEmail) return false;
      if (!q) return true;
      const name = (u.name ?? "").toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      return name.includes(q) || email.includes(q) || u.id.includes(q);
    });
  }, [users, query, listFilter]);

  const allSelected =
    filtered.length > 0 && filtered.every((u) => selectedIds.has(u.id));

  function toggle(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }

  function selectAllVisible() {
    const next = new Set(selectedIds);
    for (const u of filtered) next.add(u.id);
    onChange(next);
  }

  function clearSelection() {
    onChange(new Set());
  }

  function toggleSelectAllVisible() {
    if (allSelected) {
      const next = new Set(selectedIds);
      for (const u of filtered) next.delete(u.id);
      onChange(next);
    } else {
      selectAllVisible();
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-800/70 bg-[#0a0e12]/80">
      <div className="border-b border-zinc-800/60 bg-zinc-900/40 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-zinc-200">Select recipients</h3>
            <p className="text-xs text-zinc-500">
              {selectedIds.size} selected · {users.length} total users
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAllVisible}
              className="rounded-lg border border-zinc-700/80 bg-zinc-950/80 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-zinc-100"
            >
              {allSelected ? "Deselect visible" : "Select visible"}
            </button>
            <button
              type="button"
              onClick={clearSelection}
              disabled={selectedIds.size === 0}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:text-zinc-300 disabled:opacity-40"
            >
              Clear all
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3 border-b border-zinc-800/60 px-4 py-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className={`${theme.input} w-full pl-10`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "all" as const, label: "All" },
              { key: "has_email" as const, label: "Has email" },
              { key: "no_email" as const, label: "No email" },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setListFilter(f.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                listFilter === f.key
                  ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/35"
                  : "bg-zinc-900/80 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto self-center text-xs text-zinc-600">
            {filtered.length} shown
          </span>
        </div>
      </div>

      <ul className="max-h-72 divide-y divide-zinc-800/50 overflow-y-auto">
        {filtered.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-zinc-500">
            No users match this search or filter.
          </li>
        ) : (
          filtered.map((user) => {
            const checked = selectedIds.has(user.id);
            const hasEmail = !!user.email?.trim();
            const initials = (user.name ?? user.email ?? "?")
              .slice(0, 2)
              .toUpperCase();
            return (
              <li key={user.id}>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-zinc-900/50">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      checked
                        ? "bg-amber-500/20 text-amber-200"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-zinc-100">
                      {user.name ?? "Unnamed user"}
                    </span>
                    <span className="block truncate text-xs text-zinc-500">
                      {user.email ?? "In-app only"}
                    </span>
                  </span>
                  {!hasEmail && (
                    <span className="hidden shrink-0 rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500 sm:inline">
                      No email
                    </span>
                  )}
                  <input
                    type="checkbox"
                    name="userIds"
                    value={user.id}
                    checked={checked}
                    onChange={() => toggle(user.id)}
                    className="h-4 w-4 shrink-0 rounded border-zinc-600 bg-zinc-900 text-amber-500"
                    aria-label={`Select ${user.name ?? user.email}`}
                  />
                </label>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
