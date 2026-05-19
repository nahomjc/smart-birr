"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/require-user";
import { EXPENSE_CATEGORIES } from "@/lib/finance/categories";
import { generateBudgetPlan } from "@/lib/finance/budget-engine";
import { saveCustomBudgetSettings } from "@/lib/finance/budget-service";

export type SuggestedBudgetValues = {
  monthlyIncome: string;
  savingsGoal: string;
  emergencyFund: string;
  categoryLimits: { name: string; limit: string }[];
};

export type BudgetSettingsState = {
  error?: string;
  success?: boolean;
  suggested?: SuggestedBudgetValues;
} | null;

function parseLimits(formData: FormData) {
  const categoryLimits: Record<string, number> = {};
  for (const name of EXPENSE_CATEGORIES) {
    const raw = formData.get(`limit_${name}`);
    if (raw === null || raw === "") continue;
    const value = Number(raw);
    if (!Number.isNaN(value) && value >= 0) {
      categoryLimits[name] = value;
    }
  }
  return categoryLimits;
}

export async function saveBudgetSettings(
  _prev: BudgetSettingsState,
  formData: FormData,
): Promise<BudgetSettingsState> {
  const monthlyIncome = Number(formData.get("monthlyIncome"));
  const savingsGoal = Number(formData.get("savingsGoal") ?? 0);
  const emergencyFund = Number(formData.get("emergencyFund") ?? 0);

  if (!monthlyIncome || monthlyIncome <= 0) {
    return { error: "Enter a valid monthly income" };
  }

  const categoryLimits = parseLimits(formData);
  if (Object.keys(categoryLimits).length === 0) {
    return { error: "Set at least one category limit" };
  }

  try {
    const userId = await requireUserId();
    await saveCustomBudgetSettings(userId, {
      monthlyIncome,
      savingsGoal: Math.max(0, savingsGoal),
      emergencyFund: Math.max(0, emergencyFund),
      categoryLimits,
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/budget");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to save settings",
    };
  }
}

export async function suggestBudgetFromIncome(
  _prev: BudgetSettingsState,
  formData: FormData,
): Promise<BudgetSettingsState> {
  const monthlyIncome = Number(formData.get("monthlyIncome"));
  if (!monthlyIncome || monthlyIncome <= 0) {
    return { error: "Enter income to get suggestions" };
  }

  const plan = generateBudgetPlan(monthlyIncome);
  return {
    suggested: {
      monthlyIncome: String(plan.monthlyIncome),
      savingsGoal: String(plan.savingsGoal),
      emergencyFund: String(plan.emergencyFund),
      categoryLimits: EXPENSE_CATEGORIES.map((name) => ({
        name,
        limit: String(plan.categoryLimits[name] ?? 0),
      })),
    },
  };
}
