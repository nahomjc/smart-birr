import { desc, eq } from "drizzle-orm";
import { formatRoleLabel, isAdminRole, roleToAppRole } from "@/lib/auth/roles";
import { listPlanningGoals } from "@/lib/data/planning-goals";
import { requireDb, users, recurringExpenses } from "@/lib/db";
import { getBudgetAllocation } from "@/lib/finance/budget-service";
import { getMonthlyExpenses } from "@/lib/finance/expense-service";
import {
  getMonthlyIncomeEntries,
  getMonthlyIncomeTotal,
} from "@/lib/finance/income-service";
import { formatPeriodLabel, getCurrentPeriod } from "@/lib/finance/period";
import { getUserRecurringExpenses } from "@/lib/finance/recurring-service";

export async function getAdminUserDetail(userId: string) {
  const db = requireDb();
  const period = getCurrentPeriod();
  const periodLabel = formatPeriodLabel(period.year, period.month);

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) return null;

  const [
    budget,
    expenses,
    incomeEntries,
    loggedIncomeTotal,
    recurringActive,
    recurringAll,
    planningGoals,
  ] = await Promise.all([
    getBudgetAllocation(userId, period),
    getMonthlyExpenses(userId),
    getMonthlyIncomeEntries(userId),
    getMonthlyIncomeTotal(userId),
    getUserRecurringExpenses(userId),
    db.query.recurringExpenses.findMany({
      where: eq(recurringExpenses.userId, userId),
      with: { category: true },
      orderBy: [desc(recurringExpenses.createdAt)],
    }),
    listPlanningGoals(userId),
  ]);

  const monthExpenseTotal = expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  );

  return {
    periodLabel,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      authUserId: user.authUserId,
      telegramId: user.telegramId,
      currency: user.currency,
      profileIncome: user.income != null ? Number(user.income) : null,
      role: user.role,
      roleLabel: formatRoleLabel(user.role),
      appRole: roleToAppRole(user.role),
      isAdmin: isAdminRole(user.role),
      createdAt: user.createdAt,
    },
    budget,
    expenses: expenses.map((e) => ({
      id: e.id,
      amount: Number(e.amount),
      category: e.category.name,
      description: e.description,
      date: e.date,
    })),
    monthExpenseTotal,
    incomeEntries: incomeEntries.map((e) => ({
      id: e.id,
      amount: Number(e.amount),
      source: e.source,
      description: e.description,
      date: e.date,
    })),
    loggedIncomeTotal,
    recurringActive: recurringActive.map((r) => ({
      id: r.id,
      amount: Number(r.amount),
      category: r.category.name,
      description: r.description,
      frequency: r.frequency,
      nextDueAt: r.nextDueAt,
      isActive: r.isActive,
    })),
    recurringAll: recurringAll.map((r) => ({
      id: r.id,
      amount: Number(r.amount),
      category: r.category.name,
      description: r.description,
      frequency: r.frequency,
      nextDueAt: r.nextDueAt,
      isActive: r.isActive,
    })),
    planningGoals,
  };
}

export type AdminUserDetail = NonNullable<
  Awaited<ReturnType<typeof getAdminUserDetail>>
>;
