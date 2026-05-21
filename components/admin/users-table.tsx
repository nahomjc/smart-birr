import { formatBirr } from "@/lib/data/admin-users";
import type { AdminUserRow } from "@/lib/data/admin-users";
import { theme } from "@/lib/theme";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-ET", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminUsersTable({ rows }: { rows: AdminUserRow[] }) {
  if (!rows.length) {
    return (
      <p className={`text-sm ${theme.subtext}`}>No users in the database yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[880px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-emerald-900/40 text-xs uppercase tracking-wide text-zinc-500">
            <th className="px-3 py-3 font-medium">User</th>
            <th className="px-3 py-3 font-medium">Role</th>
            <th className="px-3 py-3 font-medium">Budget (month)</th>
            <th className="px-3 py-3 font-medium">Spent (month)</th>
            <th className="px-3 py-3 font-medium">Recurring</th>
            <th className="px-3 py-3 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-emerald-900/25">
          {rows.map((row) => (
            <tr
              key={row.id}
              className="text-zinc-200 transition hover:bg-emerald-950/30"
            >
              <td className="px-3 py-3 align-top">
                <p className="font-medium text-zinc-100">
                  {row.name ?? "—"}
                </p>
                <p className={`mt-0.5 text-xs ${theme.subtext}`}>
                  {row.email ?? "no email"}
                </p>
                <p className="mt-1 font-mono text-[10px] text-zinc-600">
                  {row.id.slice(0, 8)}…
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {row.telegramLinked && (
                    <span className="rounded bg-sky-950/60 px-1.5 py-0.5 text-[10px] text-sky-300">
                      Telegram
                    </span>
                  )}
                  {row.income != null && (
                    <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-400">
                      Profile income {formatBirr(row.income)}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-3 align-top">
                <span
                  className={
                    row.isAdmin
                      ? "rounded bg-amber-950/50 px-2 py-0.5 text-xs font-medium text-amber-200"
                      : "text-xs text-zinc-400"
                  }
                >
                  {row.roleLabel}
                </span>
              </td>
              <td className="px-3 py-3 align-top">
                {row.budget ? (
                  <div className="space-y-0.5 text-xs">
                    <p className="font-medium text-emerald-400">
                      {formatBirr(row.budget.monthlyIncome)}
                    </p>
                    {row.budget.savingsGoal != null && (
                      <p className={theme.subtext}>
                        Savings {formatBirr(row.budget.savingsGoal)}
                      </p>
                    )}
                    {(row.budget.rentLimit != null ||
                      row.budget.foodLimit != null) && (
                      <p className={theme.subtext}>
                        {row.budget.rentLimit != null &&
                          `Rent ${formatBirr(row.budget.rentLimit)}`}
                        {row.budget.rentLimit != null &&
                          row.budget.foodLimit != null &&
                          " · "}
                        {row.budget.foodLimit != null &&
                          `Food ${formatBirr(row.budget.foodLimit)}`}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className={`text-xs ${theme.subtext}`}>No budget</span>
                )}
              </td>
              <td className="px-3 py-3 align-top">
                <p className="font-medium text-red-300/90">
                  {formatBirr(row.monthSpent)}
                </p>
                <p className={`text-xs ${theme.subtext}`}>
                  {row.monthExpenseCount} expense
                  {row.monthExpenseCount === 1 ? "" : "s"}
                </p>
              </td>
              <td className="px-3 py-3 align-top text-zinc-300">
                {row.activeRecurringCount}
              </td>
              <td className={`px-3 py-3 align-top text-xs ${theme.subtext}`}>
                {formatDate(row.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
