import { theme } from "@/lib/theme";

export type ExpenseRow = {
  id: string;
  amount: string;
  category: string;
  description: string | null;
  date: Date;
};

export function ExpenseList({ expenses }: { expenses: ExpenseRow[] }) {
  if (!expenses.length) {
    return (
      <p className={`text-sm ${theme.subtext}`}>
        No expenses this month. Log one above or via AI chat.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-emerald-900/30">
      {expenses.map((e) => (
        <li key={e.id} className="flex items-center justify-between py-3 text-sm">
          <div>
            <p className="font-medium text-zinc-100">{e.category}</p>
            <p className={theme.subtext}>{e.description ?? "—"}</p>
          </div>
          <div className="text-right">
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
  );
}
