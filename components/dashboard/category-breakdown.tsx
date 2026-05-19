import { Card } from "@/components/ui/card";
import type { CategorySpendRow } from "@/lib/data/dashboard";
import { formatBirr } from "@/lib/finance/budget-engine";
import { theme } from "@/lib/theme";

export function CategoryBreakdown({ rows }: { rows: CategorySpendRow[] }) {
  if (!rows.length) {
    return (
      <Card>
        <h2 className="mb-2 font-medium text-zinc-100">Spending by category</h2>
        <p className={`text-sm ${theme.subtext}`}>
          No expenses logged this month yet.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-4 font-medium text-zinc-100">Spending by category</h2>
      <ul className="space-y-4">
        {rows.map((row) => {
          const width =
            row.limit && row.limit > 0
              ? Math.min(100, Math.round((row.spent / row.limit) * 100))
              : row.spent > 0
                ? 100
                : 0;

          return (
            <li key={row.name}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span
                  className={
                    row.overBudget
                      ? "font-medium text-amber-300"
                      : "font-medium text-zinc-100"
                  }
                >
                  {row.name}
                </span>
                <span className="shrink-0 text-zinc-400">
                  {formatBirr(row.spent)}
                  {row.limit != null ? ` / ${formatBirr(row.limit)}` : ""}
                  {row.percentOfLimit != null ? ` (${row.percentOfLimit}%)` : ""}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-950/80">
                <div
                  className={`h-full rounded-full ${
                    row.overBudget ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
