import type { ExpenseCategory } from "./categories";

export type BudgetAllocation = {
  monthlyIncome: number;
  savingsGoal: number;
  rentLimit: number;
  foodLimit: number;
  transportLimit: number;
  entertainmentLimit: number;
  emergencyFund: number;
  discretionary: number;
  categoryLimits: Record<string, number>;
};

export type BudgetPlanWithLimits = BudgetAllocation;

/** Expense category shares (70% of income); savings 20% + emergency 10% = 100% */
const CATEGORY_SHARES: Record<ExpenseCategory, number> = {
  Food: 0.15,
  Transport: 0.1,
  Rent: 0.3,
  Subscriptions: 0.03,
  Shopping: 0.03,
  Utilities: 0.02,
  Healthcare: 0.01,
  Education: 0.01,
  Entertainment: 0.05,
  Other: 0,
};

/** 50/30/20-inspired plan tuned for Ethiopian birr budgets */
export function generateBudgetPlan(monthlyIncome: number): BudgetPlanWithLimits {
  const income = Math.max(0, monthlyIncome);
  const savingsGoal = Math.round(income * 0.2);
  const emergencyFund = Math.round(income * 0.1);

  const categoryLimits: Record<string, number> = {};
  let categoryTotal = 0;

  for (const [name, share] of Object.entries(CATEGORY_SHARES)) {
    const limit = Math.round(income * share);
    categoryLimits[name] = limit;
    categoryTotal += limit;
  }

  const rentLimit = categoryLimits.Rent;
  const foodLimit = categoryLimits.Food;
  const transportLimit = categoryLimits.Transport;
  const entertainmentLimit = categoryLimits.Entertainment;
  const discretionary = Math.max(
    0,
    income - savingsGoal - emergencyFund - categoryTotal,
  );
  if (discretionary > 0) {
    categoryLimits.Other = (categoryLimits.Other ?? 0) + discretionary;
  }

  return {
    monthlyIncome: income,
    savingsGoal,
    rentLimit,
    foodLimit,
    transportLimit,
    entertainmentLimit,
    emergencyFund,
    discretionary,
    categoryLimits,
  };
}

export function formatBirr(amount: number, currency = "ETB"): string {
  return `${amount.toLocaleString("en-ET")} ${currency}`;
}

export function spendingSummary(
  expenses: { amount: string; category: { name: string } }[],
  budget?: BudgetAllocation | null,
) {
  const byCategory: Record<string, number> = {};
  let total = 0;
  for (const e of expenses) {
    const amt = Number(e.amount);
    total += amt;
    const name = e.category.name;
    byCategory[name] = (byCategory[name] ?? 0) + amt;
  }

  const warnings: string[] = [];
  const limits = budget?.categoryLimits ?? {};
  if (budget && Object.keys(limits).length === 0) {
    limits.Food = budget.foodLimit;
    limits.Transport = budget.transportLimit;
    limits.Rent = budget.rentLimit;
    limits.Entertainment = budget.entertainmentLimit;
  }

  for (const [category, limit] of Object.entries(limits)) {
    const spent = byCategory[category] ?? 0;
    if (limit > 0 && spent > limit) {
      warnings.push(
        `${category} spending (${formatBirr(spent)}) exceeds your ${category.toLowerCase()} budget (${formatBirr(limit)}).`,
      );
    }
  }

  return { total, byCategory, warnings };
}
