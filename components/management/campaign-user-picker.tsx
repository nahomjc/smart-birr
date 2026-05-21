"use client";

import { useMemo, useState } from "react";
import type { CampaignPickerUser } from "@/lib/campaigns/campaign-service";
import { theme } from "@/lib/theme";

type Props = {
  users: CampaignPickerUser[];
  selectedIds: Set<string>;
  onChange: (ids: Set<string>) => void;
};

export function CampaignUserPicker({ users, selectedIds, onChange }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = (u.name ?? "").toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      return name.includes(q) || email.includes(q) || u.id.includes(q);
    });
  }, [users, query]);

  const withEmailInFiltered = filtered.filter((u) => u.email?.trim()).length;

  function toggle(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }

  function selectAllFiltered() {
    const next = new Set(selectedIds);
    for (const u of filtered) next.add(u.id);
    onChange(next);
  }

  function clearSelection() {
    onChange(new Set());
  }

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Select users ({selectedIds.size} selected)
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAllFiltered}
            className="text-xs text-amber-400 hover:underline"
          >
            Select {filtered.length === users.length ? "all" : "filtered"}
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            Clear
          </button>
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name or email…"
        className={theme.input}
      />

      <p className="text-xs text-zinc-600">
        Showing {filtered.length} of {users.length}
        {withEmailInFiltered < filtered.length && (
          <> · {withEmailInFiltered} with email in this list</>
        )}
      </p>

      <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <li className="py-6 text-center text-sm text-zinc-500">
            No users match your search.
          </li>
        ) : (
          filtered.map((user) => {
            const checked = selectedIds.has(user.id);
            const hasEmail = !!user.email?.trim();
            return (
              <li key={user.id}>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition ${
                    checked
                      ? "bg-amber-500/10 ring-1 ring-amber-500/25"
                      : "hover:bg-zinc-900/60"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="userIds"
                    value={user.id}
                    checked={checked}
                    onChange={() => toggle(user.id)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-600 bg-zinc-900 text-amber-500"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-zinc-200">
                      {user.name ?? "Unnamed"}
                    </span>
                    <span className="block truncate text-xs text-zinc-500">
                      {user.email ?? "No email — in-app only"}
                    </span>
                  </span>
                  {!hasEmail && (
                    <span className="shrink-0 text-[10px] text-zinc-600">
                      no email
                    </span>
                  )}
                </label>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
