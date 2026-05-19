import { and, eq } from "drizzle-orm";
import {
  requireDb,
  budgets,
  budgetLimits,
  users,
  type Budget,
} from "../db";
import { ensureSystemCategories, getCategoryByName } from "../db/seed-categories";
import {
  generateBudgetPlan,
  type BudgetAllocation,
  type BudgetPlanWithLimits,
} from "./budget-engine";
import { getCurrentPeriod, type BudgetPeriod } from "./period";

export async function getBudgetForPeriod(
  userId: string,
  period: BudgetPeriod = getCurrentPeriod(),
): Promise<Budget | undefined> {
  const db = requireDb();
  return db.query.budgets.findFirst({
    where: and(
      eq(budgets.userId, userId),
      eq(budgets.year, period.year),
      eq(budgets.month, period.month),
    ),
  });
}

export async function getCurrentBudget(userId: string) {
  return getBudgetForPeriod(userId, getCurrentPeriod());
}

export async function getBudgetCategoryLimits(
  budgetId: string,
): Promise<Record<string, number>> {
  const db = requireDb();
  const rows = await db.query.budgetLimits.findMany({
    where: eq(budgetLimits.budgetId, budgetId),
    with: { category: true },
  });
  const map: Record<string, number> = {};
  for (const row of rows) {
    map[row.category.name] = Number(row.limitAmount);
  }
  return map;
}

export function budgetRowToAllocation(
  budget: Budget,
  categoryLimits: Record<string, number>,
): BudgetAllocation {
  return {
    monthlyIncome: Number(budget.monthlyIncome),
    savingsGoal: Number(budget.savingsGoal ?? 0),
    rentLimit: categoryLimits.Rent ?? Number(budget.rentLimit ?? 0),
    foodLimit: categoryLimits.Food ?? Number(budget.foodLimit ?? 0),
    transportLimit:
      categoryLimits.Transport ?? Number(budget.transportLimit ?? 0),
    entertainmentLimit:
      categoryLimits.Entertainment ?? Number(budget.entertainmentLimit ?? 0),
    emergencyFund: Number(budget.emergencyFund ?? 0),
    discretionary: 0,
    categoryLimits,
  };
}

export async function getBudgetAllocation(
  userId: string,
  period: BudgetPeriod = getCurrentPeriod(),
): Promise<BudgetAllocation | null> {
  const budget = await getBudgetForPeriod(userId, period);
  if (!budget) return null;
  const categoryLimits = await getBudgetCategoryLimits(budget.id);
  return budgetRowToAllocation(budget, categoryLimits);
}

async function syncBudgetLimitsMap(
  budgetId: string,
  limits: Record<string, number>,
) {
  const db = requireDb();
  await ensureSystemCategories();

  for (const [categoryName, limit] of Object.entries(limits)) {
    if (limit < 0) continue;
    const category = await getCategoryByName(categoryName);
    if (!category) continue;

    const existing = await db.query.budgetLimits.findFirst({
      where: and(
        eq(budgetLimits.budgetId, budgetId),
        eq(budgetLimits.categoryId, category.id),
      ),
    });

    const values = {
      budgetId,
      categoryId: category.id,
      limitAmount: String(limit),
    };

    if (existing) {
      await db
        .update(budgetLimits)
        .set({ limitAmount: values.limitAmount })
        .where(eq(budgetLimits.id, existing.id));
    } else {
      await db.insert(budgetLimits).values(values);
    }
  }
}

async function syncBudgetLimits(budgetId: string, plan: BudgetPlanWithLimits) {
  await syncBudgetLimitsMap(budgetId, plan.categoryLimits);
}

export type CustomBudgetSettings = {
  monthlyIncome: number;
  savingsGoal: number;
  emergencyFund: number;
  categoryLimits: Record<string, number>;
};

export async function saveCustomBudgetSettings(
  userId: string,
  settings: CustomBudgetSettings,
  period: BudgetPeriod = getCurrentPeriod(),
) {
  const db = requireDb();
  const income = Math.max(0, settings.monthlyIncome);
  const limits = settings.categoryLimits;

  const values = {
    userId,
    year: period.year,
    month: period.month,
    monthlyIncome: String(income),
    savingsGoal: String(Math.max(0, settings.savingsGoal)),
    rentLimit: String(limits.Rent ?? 0),
    foodLimit: String(limits.Food ?? 0),
    transportLimit: String(limits.Transport ?? 0),
    entertainmentLimit: String(limits.Entertainment ?? 0),
    emergencyFund: String(Math.max(0, settings.emergencyFund)),
    updatedAt: new Date(),
  };

  const existing = await getBudgetForPeriod(userId, period);
  let budget: Budget;
  if (existing) {
    const [updated] = await db
      .update(budgets)
      .set(values)
      .where(eq(budgets.id, existing.id))
      .returning();
    budget = updated;
  } else {
    const [created] = await db.insert(budgets).values(values).returning();
    budget = created;
  }

  await syncBudgetLimitsMap(budget.id, limits);

  if (income > 0) {
    await db
      .update(users)
      .set({ income: String(income) })
      .where(eq(users.id, userId));
  }

  return budget;
}

export async function upsertBudgetFromIncome(
  userId: string,
  monthlyIncome: number,
  period: BudgetPeriod = getCurrentPeriod(),
) {
  const db = requireDb();
  const plan = generateBudgetPlan(monthlyIncome);
  const values = {
    userId,
    year: period.year,
    month: period.month,
    monthlyIncome: String(plan.monthlyIncome),
    savingsGoal: String(plan.savingsGoal),
    rentLimit: String(plan.rentLimit),
    foodLimit: String(plan.foodLimit),
    transportLimit: String(plan.transportLimit),
    entertainmentLimit: String(plan.entertainmentLimit),
    emergencyFund: String(plan.emergencyFund),
    updatedAt: new Date(),
  };

  const existing = await getBudgetForPeriod(userId, period);

  let budget: Budget;
  if (existing) {
    const [updated] = await db
      .update(budgets)
      .set(values)
      .where(eq(budgets.id, existing.id))
      .returning();
    budget = updated;
  } else {
    const [created] = await db.insert(budgets).values(values).returning();
    budget = created;
  }

  await syncBudgetLimits(budget.id, plan);

  await db
    .update(users)
    .set({ income: String(plan.monthlyIncome) })
    .where(eq(users.id, userId));

  return budget;
}
