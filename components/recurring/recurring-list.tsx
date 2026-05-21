import { Button } from "@/components/ui/button";
import { formatBirr } from "@/lib/finance/budget-engine";
import { EXPENSE_CATEGORIES } from "@/lib/finance/categories";
import { toDateKey } from "@/lib/finance/period";
import {
  saveRecurringUpdate,
  toggleRecurringActive,
} from "@/app/actions/recurring";
import { theme } from "@/lib/theme";

export type RecurringRow = {
  id: string;
  amount: string;
  frequency: string;
  description: string | null;
  nextDueAt: Date;
  isActive: boolean;
  category: { name: string };
};

function formatDueDate(d: Date) {
  return new Date(d).toLocaleDateString("en-ET", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function frequencyLabel(frequency: string) {
  return frequency === "weekly" ? "Weekly" : "Monthly";
}

export function RecurringList({ items }: { items: RecurringRow[] }) {
  if (!items.length) {
    return (
      <p className={`text-sm ${theme.subtext}`}>
        No recurring bills yet. Add rent, subscriptions, or other repeating
        costs above — they will appear on the calendar and log automatically when
        due.
      </p>
    );
  }

  const activeCount = items.filter((i) => i.isActive).length;

  return (
    <div className="space-y-4">
      <p className={`text-sm ${theme.subtext}`}>
        {activeCount} active · {items.length - activeCount} paused
      </p>
      <ul className="space-y-6">
        {items.map((item) => {
          const dueKey = toDateKey(new Date(item.nextDueAt));
          return (
            <li
              key={item.id}
              className={`rounded-xl border p-4 ${
                item.isActive
                  ? "border-emerald-900/40 bg-emerald-950/20"
                  : "border-zinc-800/60 bg-zinc-950/40 opacity-80"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-100">
                    {item.category.name}
                    {!item.isActive && (
                      <span className="ml-2 text-xs font-normal text-zinc-500">
                        (paused)
                      </span>
                    )}
                  </p>
                  {item.description ? (
                    <p className={`mt-0.5 text-sm ${theme.subtext}`}>
                      {item.description}
                    </p>
                  ) : null}
                  <p className={`mt-1 text-sm ${theme.subtext}`}>
                    {formatBirr(Number(item.amount))} ·{" "}
                    {frequencyLabel(item.frequency)} · Next due{" "}
                    {formatDueDate(item.nextDueAt)}
                  </p>
                </div>
                <form action={toggleRecurringActive}>
                  <input type="hidden" name="id" value={item.id} />
                  <input
                    type="hidden"
                    name="active"
                    value={item.isActive ? "false" : "true"}
                  />
                  <Button type="submit" variant="secondary" className="text-xs">
                    {item.isActive ? "Pause" : "Resume"}
                  </Button>
                </form>
              </div>

              <details className="mt-4 group">
                <summary className="cursor-pointer text-sm text-emerald-400 hover:underline">
                  Edit
                </summary>
                <form action={saveRecurringUpdate} className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="id" value={item.id} />
                  <label className="block text-sm">
                    <span className={`mb-1 block ${theme.subtext}`}>Amount</span>
                    <input
                      name="amount"
                      type="number"
                      min="1"
                      step="0.01"
                      required
                      defaultValue={Number(item.amount)}
                      className={theme.input}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className={`mb-1 block ${theme.subtext}`}>Category</span>
                    <select
                      name="category"
                      defaultValue={item.category.name}
                      className={theme.input}
                    >
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className={`mb-1 block ${theme.subtext}`}>Frequency</span>
                    <select
                      name="frequency"
                      defaultValue={item.frequency}
                      className={theme.input}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className={`mb-1 block ${theme.subtext}`}>
                      Next due date
                    </span>
                    <input
                      name="nextDueAt"
                      type="date"
                      required
                      defaultValue={dueKey}
                      className={theme.input}
                    />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className={`mb-1 block ${theme.subtext}`}>
                      Description
                    </span>
                    <input
                      name="description"
                      defaultValue={item.description ?? ""}
                      className={theme.input}
                    />
                  </label>
                  <Button type="submit" variant="secondary" className="sm:col-span-2">
                    Save changes
                  </Button>
                </form>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
