import { and, count, desc, eq, gte, lt, sum } from "drizzle-orm";
import { formatBirr } from "@/lib/finance/budget-engine";
import { getCurrentPeriod, getMonthBounds, formatPeriodLabel } from "@/lib/finance/period";
import { formatRoleLabel, isAdminRole } from "@/lib/auth/roles";
import {
  requireDb,
  users,
  budgets,
  expenses,
  recurringExpenses,
} from "@/lib/db";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  roleLabel: string;
  isAdmin: boolean;
  telegramLinked: boolean;
  income: number | null;
  currency: string;
  createdAt: Date;
  budget: {
    monthlyIncome: number;
    savingsGoal: number | null;
    rentLimit: number | null;
    foodLimit: number | null;
  } | null;
  monthSpent: number;
  monthExpenseCount: number;
  activeRecurringCount: number;
};

export type AdminUsersOverview = {
  periodLabel: string;
  totalUsers: number;
  withBudgetThisMonth: number;
  rows: AdminUserRow[];
};

export async function getAdminUsersOverview(): Promise<AdminUsersOverview> {
  const db = requireDb();
  const period = getCurrentPeriod();
  const { start, end } = getMonthBounds(period.year, period.month);

  const [allUsers, budgetRows, expenseStats, recurringStats] = await Promise.all([
    db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    }),
    db.query.budgets.findMany({
      where: and(
        eq(budgets.year, period.year),
        eq(budgets.month, period.month),
      ),
    }),
    db
      .select({
        userId: expenses.userId,
        total: sum(expenses.amount),
        expenseCount: count(),
      })
      .from(expenses)
      .where(and(gte(expenses.date, start), lt(expenses.date, end)))
      .groupBy(expenses.userId),
    db
      .select({
        userId: recurringExpenses.userId,
        recurringCount: count(),
      })
      .from(recurringExpenses)
      .where(eq(recurringExpenses.isActive, true))
      .groupBy(recurringExpenses.userId),
  ]);

  const budgetByUser = new Map(budgetRows.map((b) => [b.userId, b]));
  const spentByUser = new Map(
    expenseStats.map((s) => [
      s.userId,
      { total: Number(s.total ?? 0), count: Number(s.expenseCount ?? 0) },
    ]),
  );
  const recurringByUser = new Map(
    recurringStats.map((s) => [s.userId, Number(s.recurringCount ?? 0)]),
  );

  const rows: AdminUserRow[] = allUsers.map((u) => {
    const budget = budgetByUser.get(u.id);
    const spent = spentByUser.get(u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      roleLabel: formatRoleLabel(u.role),
      isAdmin: isAdminRole(u.role),
      telegramLinked: u.telegramId != null,
      income: u.income != null ? Number(u.income) : null,
      currency: u.currency,
      createdAt: u.createdAt,
      budget: budget
        ? {
            monthlyIncome: Number(budget.monthlyIncome),
            savingsGoal:
              budget.savingsGoal != null ? Number(budget.savingsGoal) : null,
            rentLimit:
              budget.rentLimit != null ? Number(budget.rentLimit) : null,
            foodLimit:
              budget.foodLimit != null ? Number(budget.foodLimit) : null,
          }
        : null,
      monthSpent: spent?.total ?? 0,
      monthExpenseCount: spent?.count ?? 0,
      activeRecurringCount: recurringByUser.get(u.id) ?? 0,
    };
  });

  return {
    periodLabel: formatPeriodLabel(period.year, period.month),
    totalUsers: rows.length,
    withBudgetThisMonth: rows.filter((r) => r.budget != null).length,
    rows,
  };
}

export { formatBirr };
