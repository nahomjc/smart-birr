import { formatBirr } from "@/lib/finance/budget-engine";
import { theme } from "@/lib/theme";

export type ExpenseRow = {
  id: string;
  amount: string;
  category: { name: string };
  description: string | null;
  date: Date;
};

export function ExpenseList({ expenses }: { expenses: ExpenseRow[] }) {
  if (!expenses.length) {
    return (
      <p className={`text-sm ${theme.subtext}`}>
        No expenses logged this month. Add one below, or tell the AI counselor
        (e.g. &quot;spent 200 birr on lunch&quot;).
      </p>
    );
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-4">
      <p className={`text-sm ${theme.subtext}`}>
        {expenses.length} transaction{expenses.length === 1 ? "" : "s"} ·{" "}
        <span className="font-medium text-emerald-400">{formatBirr(total)}</span>{" "}
        total this month
      </p>
      <ul className="divide-y divide-emerald-900/30">
        {expenses.map((e) => (
          <li
            key={e.id}
            className="flex items-center justify-between gap-4 py-3 text-sm"
          >
            <div className="min-w-0">
              <p className="font-medium text-zinc-100">{e.category.name}</p>
              {e.description ? (
                <p className={`truncate ${theme.subtext}`}>{e.description}</p>
              ) : (
                <p className="text-xs italic text-zinc-500">No description</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="font-semibold text-emerald-400">
                {Number(e.amount).toLocaleString()} ETB
              </p>
              <p className="text-xs text-zinc-400">
                {new Date(e.date).toLocaleDateString()}
              </p>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
