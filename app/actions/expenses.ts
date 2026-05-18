"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/require-user";
import { logExpense } from "@/lib/users/service";
import { normalizeCategory } from "@/lib/finance/categories";

export type ExpenseActionState = { error?: string; success?: boolean } | null;

export async function addExpense(
  _prev: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category") ?? "");
  const description = String(formData.get("description") ?? "").trim();

  if (!amount || amount <= 0) {
    return { error: "Enter a valid amount" };
  }
  if (!category) {
    return { error: "Category is required" };
  }

  try {
    const userId = await requireUserId();
    await logExpense(
      userId,
      amount,
      normalizeCategory(category),
      description || null,
    );
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/expenses");
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to add expense",
    };
  }
}
