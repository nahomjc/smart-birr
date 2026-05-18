"use server";

import { redirect } from "next/navigation";
import {
  getOrCreateWebUser,
  updateUserIncome,
  upsertBudgetFromIncome,
} from "@/lib/users/service";
import { setSessionUserId } from "@/lib/auth/session";

export type SessionActionState = { error?: string } | null;

export async function createSession(
  _prev: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const incomeRaw = String(formData.get("income") ?? "").trim();
  const income = incomeRaw ? Number(incomeRaw) : undefined;

  if (!name) {
    return { error: "Name is required" };
  }
  if (income !== undefined && (Number.isNaN(income) || income < 0)) {
    return { error: "Income must be a positive number" };
  }

  try {
    const user = await getOrCreateWebUser(name, income);
    if (income && income > 0) {
      await updateUserIncome(user.id, income);
      await upsertBudgetFromIncome(user.id, income);
    }
    await setSessionUserId(user.id);
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Setup failed",
    };
  }

  redirect("/dashboard");
}
