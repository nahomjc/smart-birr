import Link from "next/link";
import { formatBirr } from "@/lib/data/admin-users";
import type { AdminUserRow } from "@/lib/data/admin-users";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-ET", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ManagementUsersTable({ rows }: { rows: AdminUserRow[] }) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700/60 bg-zinc-900/20 px-6 py-16 text-center">
        <p className="text-sm text-zinc-400">No users registered yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-[#0c1014]/80 shadow-xl shadow-black/20">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800/80 bg-zinc-900/50">
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                User
              </th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Role
              </th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Budget
              </th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Spending
              </th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Recurring
              </th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Joined
              </th>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className={`border-b border-zinc-800/40 transition hover:bg-zinc-900/40 ${
                  index % 2 === 0 ? "bg-transparent" : "bg-zinc-950/30"
                }`}
              >
                <td className="px-5 py-4 align-top">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-xs font-semibold text-zinc-200">
                      {(row.name ?? row.email ?? "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-100">
                        {row.name ?? "Unnamed user"}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {row.email ?? "No email"}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-zinc-600">
                        {row.id}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {row.telegramLinked && (
                          <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-400 ring-1 ring-sky-500/20">
                            Telegram
                          </span>
                        )}
                        {row.income != null && (
                          <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-400">
                            Income {formatBirr(row.income)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 align-top">
                  <span
                    className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${
                      row.isAdmin
                        ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
                        : "bg-zinc-800/60 text-zinc-400"
                    }`}
                  >
                    {row.roleLabel}
                  </span>
                </td>
                <td className="px-5 py-4 align-top">
                  {row.budget ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-emerald-400">
                        {formatBirr(row.budget.monthlyIncome)}
                      </p>
                      {row.budget.savingsGoal != null && (
                        <p className="text-xs text-zinc-500">
                          Savings {formatBirr(row.budget.savingsGoal)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-600">—</span>
                  )}
                </td>
                <td className="px-5 py-4 align-top">
                  <p className="font-semibold text-zinc-200">
                    {formatBirr(row.monthSpent)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {row.monthExpenseCount} transactions
                  </p>
                </td>
                <td className="px-5 py-4 align-top">
                  <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-md bg-zinc-800/80 px-2 text-xs font-medium text-zinc-300">
                    {row.activeRecurringCount}
                  </span>
                </td>
                <td className="px-5 py-4 align-top text-xs text-zinc-500">
                  {formatDate(row.createdAt)}
                </td>
                <td className="px-5 py-4 align-top">
                  <Link
                    href={`/managment/users/${row.id}`}
                    className="text-sm font-medium text-amber-400 transition hover:text-amber-300"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
