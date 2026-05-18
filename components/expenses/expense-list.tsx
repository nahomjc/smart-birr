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
      <p className="text-sm text-zinc-500">
        No expenses this month. Log one above or via AI chat.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {expenses.map((e) => (
        <li key={e.id} className="flex items-center justify-between py-3 text-sm">
          <div>
            <p className="font-medium">{e.category}</p>
            <p className="text-zinc-500">{e.description ?? "—"}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-emerald-700 dark:text-emerald-400">
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
