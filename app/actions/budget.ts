"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/require-user";
import { upsertBudgetFromIncome } from "@/lib/users/service";
import {
  generateBudgetPlan,
  type BudgetAllocation,
} from "@/lib/finance/budget-engine";

export type BudgetActionState = {
  error?: string;
  plan?: BudgetAllocation;
} | null;

export async function generateBudget(
  _prev: BudgetActionState,
  formData: FormData,
): Promise<BudgetActionState> {
  const monthlyIncome = Number(formData.get("monthlyIncome"));

  if (!monthlyIncome || monthlyIncome <= 0) {
    return { error: "Enter a valid monthly income" };
  }

  try {
    const userId = await requireUserId();
    await upsertBudgetFromIncome(userId, monthlyIncome);
    const plan = generateBudgetPlan(monthlyIncome);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/budget");
    return { plan };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to generate budget",
    };
  }
}
