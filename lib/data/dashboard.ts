import { requireUserId } from "@/lib/auth/require-user";
import { getBudgetAllocation } from "@/lib/finance/budget-service";
import { formatBirr, spendingSummary } from "@/lib/finance/budget-engine";
import { getMonthlyIncomeTotal } from "@/lib/finance/income-service";
import { getCurrentPeriod } from "@/lib/finance/period";
import { formatBirr as formatBirrEngine } from "@/lib/finance/budget-engine";
import { getActiveRecurringExpenses } from "@/lib/finance/recurring-service";
import {
  getMonthlyExpenses,
  getUserById,
  type MonthlyExpensesResult,
} from "@/lib/users/service";

export type CategorySpendRow = {
  name: string;
  spent: number;
  limit: number | null;
  percentOfLimit: number | null;
  overBudget: boolean;
};

export type DashboardOverview = {
  userName: string;
  periodLabel: string;
  hasBudget: boolean;
  budgetIncome: number | null;
  loggedIncome: number;
  totalSpent: number;
  remaining: number | null;
  savingsGoal: number | null;
  warnings: string[];
  byCategory: Record<string, number>;
  categoryRows: CategorySpendRow[];
  recentExpenses: Awaited<
    ReturnType<typeof getMonthlyExpenses>
  >["expenses"];
  recurringCount: number;
  recurringFootnote: string;
  autoLoggedRecurring: MonthlyExpensesResult["autoLogged"];
};

function formatPeriodLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("en-ET", {
    month: "long",
    year: "numeric",
  });
}

export async function getDashboardOverview(
  userId?: string,
): Promise<DashboardOverview> {
  const id = userId ?? (await requireUserId());
  const period = getCurrentPeriod();

  const user = await getUserById(id);
  const { expenses, autoLogged } = await getMonthlyExpenses(id);
  const allocation = await getBudgetAllocation(id);
  const loggedIncome = await getMonthlyIncomeTotal(id);
  const recurring = await getActiveRecurringExpenses(id);

  const nextDue = recurring[0];
  const recurringFootnote =
    recurring.length === 0
      ? "No active schedules"
      : nextDue
        ? `Next: ${nextDue.category.name} · ${formatBirrEngine(Number(nextDue.amount))}`
        : "active schedules";

  const summary = spendingSummary(expenses, allocation);
  const budgetIncome = allocation?.monthlyIncome ?? null;
  const remaining =
    budgetIncome != null ? Math.max(0, budgetIncome - summary.total) : null;

  const limits = allocation?.categoryLimits ?? {};
  const categoryRows: CategorySpendRow[] = Object.entries(summary.byCategory)
    .map(([name, spent]) => {
      const limit = limits[name] ?? null;
      const percentOfLimit =
        limit && limit > 0 ? Math.round((spent / limit) * 100) : null;
      return {
        name,
        spent,
        limit,
        percentOfLimit,
        overBudget: limit != null && limit > 0 && spent > limit,
      };
    })
    .sort((a, b) => b.spent - a.spent);

  return {
    userName: user?.name ?? "there",
    periodLabel: formatPeriodLabel(period.year, period.month),
    hasBudget: allocation != null,
    budgetIncome,
    loggedIncome,
    totalSpent: summary.total,
    remaining,
    savingsGoal: allocation?.savingsGoal ?? null,
    warnings: summary.warnings,
    byCategory: summary.byCategory,
    categoryRows,
    recentExpenses: expenses.slice(0, 5),
    recurringCount: recurring.length,
    recurringFootnote,
    autoLoggedRecurring: autoLogged,
  };
}

export { formatBirr };
