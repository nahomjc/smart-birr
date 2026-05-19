import { requireUserId } from "@/lib/auth/require-user";
import { getBudgetAllocation } from "@/lib/finance/budget-service";
import { getExpensesBetween } from "@/lib/finance/expense-service";
import { getMonthBounds, toDateKey } from "@/lib/finance/period";

export type TimelinePoint = {
  id: string;
  label: string;
  spent: number;
  /** Daily allowance or monthly budget reference for this point */
  budgetGuide: number;
  tooltipTitle: string;
};

export type SpendingTimelineData = {
  periodLabel: string;
  budgetTotal: number;
  totalSpent: number;
  remaining: number | null;
  daysInMonth: number;
  daySeries: TimelinePoint[];
  monthSeries: TimelinePoint[];
};

type ExpenseRow = Awaited<ReturnType<typeof getExpensesBetween>>[number];

function sumExpensesOnDate(expenses: ExpenseRow[], dateKey: string): number {
  return expenses
    .filter((e) => toDateKey(new Date(e.date)) === dateKey)
    .reduce((s, e) => s + Number(e.amount), 0);
}

function monthShortLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("en-ET", {
    month: "short",
  });
}

export async function getSpendingTimeline(
  userId?: string,
): Promise<SpendingTimelineData> {
  const id = userId ?? (await requireUserId());
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const { start } = getMonthBounds(year, month);
  const daysInMonth = new Date(year, month, 0).getDate();

  const rangeStart = new Date(year, month - 6, 1);
  const expenses = await getExpensesBetween(id, rangeStart, now);

  const monthExpenses = expenses.filter((e) => {
    const t = new Date(e.date);
    return t.getFullYear() === year && t.getMonth() + 1 === month;
  });

  const allocation = await getBudgetAllocation(id);
  const budgetTotal = allocation?.monthlyIncome ?? 0;
  const dailyGuide =
    budgetTotal > 0 ? Math.round(budgetTotal / daysInMonth) : 0;

  const totalSpent = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const remaining =
    budgetTotal > 0 ? Math.max(0, budgetTotal - totalSpent) : null;

  const periodLabel = start.toLocaleDateString("en-ET", {
    month: "long",
    year: "numeric",
    timeZone: "Africa/Addis_Ababa",
  });

  const todayKey = toDateKey(now);
  const daySeries: TimelinePoint[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d, 12, 0, 0, 0);
    const dateKey = toDateKey(date);
    if (dateKey > todayKey) break;

    const spent = sumExpensesOnDate(monthExpenses, dateKey);
    const showLabel = d === 1 || d % 4 === 0 || dateKey === todayKey;

    daySeries.push({
      id: dateKey,
      label: showLabel ? String(d) : "",
      spent,
      budgetGuide: dailyGuide,
      tooltipTitle: date.toLocaleDateString("en-ET", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "Africa/Addis_Ababa",
      }),
    });
  }

  const monthSeries: TimelinePoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const bounds = getMonthBounds(y, m);
    const rows = expenses.filter((e) => {
      const t = new Date(e.date).getTime();
      return t >= bounds.start.getTime() && t < bounds.end.getTime();
    });
    const spent = rows.reduce((s, e) => s + Number(e.amount), 0);

    monthSeries.push({
      id: `${y}-${m}`,
      label: monthShortLabel(y, m),
      spent,
      budgetGuide: budgetTotal,
      tooltipTitle: `${monthShortLabel(y, m)}${y !== year ? ` ${y}` : ""}`,
    });
  }

  return {
    periodLabel,
    budgetTotal,
    totalSpent,
    remaining,
    daysInMonth,
    daySeries,
    monthSeries,
  };
}
