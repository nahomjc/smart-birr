import { and, desc, eq, gte, lt } from "drizzle-orm";
import { requireDb, expenses, incomeEntries } from "@/lib/db";
import { getBudgetAllocation } from "@/lib/finance/budget-service";
import { spendingSummary } from "@/lib/finance/budget-engine";
import {
  formatPeriodLabel,
  getCurrentPeriod,
  getMonthBounds,
  type BudgetPeriod,
} from "@/lib/finance/period";
import { listPlanningGoals } from "@/lib/data/planning-goals";
import { getUserById } from "@/lib/users/service";
import type { CategorySpendRow } from "@/lib/data/dashboard";

export type MonthlyReportExpenseRow = {
  date: Date;
  category: string;
  description: string | null;
  amount: number;
};

export type MonthlyReportIncomeRow = {
  date: Date;
  source: string;
  description: string | null;
  amount: number;
};

export type MonthlyReportPlanningRow = {
  title: string;
  targetAmount: number;
  savedTotal: number;
  percent: number;
  status: string;
};

export type MonthlyReportData = {
  period: BudgetPeriod;
  periodLabel: string;
  userName: string;
  generatedAt: Date;
  hasBudget: boolean;
  budgetIncome: number | null;
  loggedIncome: number;
  totalSpent: number;
  remaining: number | null;
  savingsGoal: number | null;
  warnings: string[];
  categoryRows: CategorySpendRow[];
  expenses: MonthlyReportExpenseRow[];
  income: MonthlyReportIncomeRow[];
  planningGoals: MonthlyReportPlanningRow[];
};

export function parseReportPeriod(
  yearParam?: string | null,
  monthParam?: string | null,
): BudgetPeriod {
  const year = Number(yearParam);
  const month = Number(monthParam);
  if (year && month >= 1 && month <= 12) {
    return { year, month };
  }
  return getCurrentPeriod();
}

export function isNearMonthEnd(date = new Date()): boolean {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return date.getDate() >= lastDay - 2;
}

export async function getMonthlyReportData(
  userId: string,
  period: BudgetPeriod = getCurrentPeriod(),
): Promise<MonthlyReportData> {
  const { start, end } = getMonthBounds(period.year, period.month);
  const db = requireDb();

  const [user, expenseRows, incomeRows, allocation, goals] = await Promise.all([
    getUserById(userId),
    db.query.expenses.findMany({
      where: and(
        eq(expenses.userId, userId),
        gte(expenses.date, start),
        lt(expenses.date, end),
      ),
      orderBy: [desc(expenses.date)],
      with: { category: true },
    }),
    db.query.incomeEntries.findMany({
      where: and(
        eq(incomeEntries.userId, userId),
        gte(incomeEntries.date, start),
        lt(incomeEntries.date, end),
      ),
      orderBy: [desc(incomeEntries.date)],
    }),
    getBudgetAllocation(userId, period),
    listPlanningGoals(userId),
  ]);

  const summary = spendingSummary(expenseRows, allocation);
  const budgetIncome = allocation?.monthlyIncome ?? null;
  const loggedIncome = incomeRows.reduce((sum, e) => sum + Number(e.amount), 0);
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
    period,
    periodLabel: formatPeriodLabel(period.year, period.month),
    userName: user?.name ?? "User",
    generatedAt: new Date(),
    hasBudget: allocation != null,
    budgetIncome,
    loggedIncome,
    totalSpent: summary.total,
    remaining,
    savingsGoal: allocation?.savingsGoal ?? null,
    warnings: summary.warnings,
    categoryRows,
    expenses: expenseRows.map((row) => ({
      date: new Date(row.date),
      category: row.category.name,
      description: row.description,
      amount: Number(row.amount),
    })),
    income: incomeRows.map((row) => ({
      date: new Date(row.date),
      source: row.source,
      description: row.description,
      amount: Number(row.amount),
    })),
    planningGoals: goals.map((g) => ({
      title: g.title,
      targetAmount: g.targetAmount,
      savedTotal: g.progress.savedTotal,
      percent: g.progress.percent,
      status: g.status,
    })),
  };
}

export function monthlyReportFilename(period: BudgetPeriod): string {
  const month = String(period.month).padStart(2, "0");
  return `smart-birr-report-${period.year}-${month}.xlsx`;
}
