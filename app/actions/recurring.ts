"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/require-user";
import { normalizeCategory } from "@/lib/finance/categories";
import { dateKeyToLocalDate, isValidDateKey } from "@/lib/finance/period";
import {
  createRecurringExpense,
  updateRecurringExpense,
  type RecurringFrequency,
} from "@/lib/finance/recurring-service";

export type RecurringActionState = { error?: string; success?: boolean } | null;

const RECURRING_PATHS = [
  "/dashboard",
  "/dashboard/recurring",
  "/dashboard/calendar",
  "/dashboard/expenses",
] as const;

function revalidateRecurring() {
  for (const path of RECURRING_PATHS) {
    revalidatePath(path);
  }
}

function parseFrequency(value: string): RecurringFrequency | null {
  if (value === "monthly" || value === "weekly") return value;
  return null;
}

function parseNextDue(formData: FormData): Date | undefined {
  const raw = String(formData.get("nextDueAt") ?? "").trim();
  if (!raw) return undefined;
  if (!isValidDateKey(raw)) {
    throw new Error("Enter a valid next due date");
  }
  return dateKeyToLocalDate(raw);
}

export async function addRecurring(
  _prev: RecurringActionState,
  formData: FormData,
): Promise<RecurringActionState> {
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const frequency = parseFrequency(String(formData.get("frequency") ?? ""));

  if (!amount || amount <= 0) {
    return { error: "Enter a valid amount" };
  }
  if (!category) {
    return { error: "Category is required" };
  }
  if (!frequency) {
    return { error: "Choose weekly or monthly" };
  }

  try {
    const userId = await requireUserId();
    const nextDueAt = parseNextDue(formData) ?? new Date();
    await createRecurringExpense(userId, {
      amount,
      category: normalizeCategory(category),
      description: description || null,
      frequency,
      nextDueAt,
    });
    revalidateRecurring();
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to add recurring bill",
    };
  }
}

export async function saveRecurringUpdate(formData: FormData): Promise<void> {
  const result = await updateRecurring(null, formData);
  if (result?.error) {
    throw new Error(result.error);
  }
}

export async function toggleRecurringActive(formData: FormData): Promise<void> {
  const result = await setRecurringActive(null, formData);
  if (result?.error) {
    throw new Error(result.error);
  }
}

export async function updateRecurring(
  _prev: RecurringActionState,
  formData: FormData,
): Promise<RecurringActionState> {
  const id = String(formData.get("id") ?? "");
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const frequency = parseFrequency(String(formData.get("frequency") ?? ""));

  if (!id) return { error: "Missing bill id" };
  if (!amount || amount <= 0) {
    return { error: "Enter a valid amount" };
  }
  if (!category) return { error: "Category is required" };
  if (!frequency) return { error: "Choose weekly or monthly" };

  try {
    const userId = await requireUserId();
    const nextDueAt = parseNextDue(formData);
    await updateRecurringExpense(userId, id, {
      amount,
      category: normalizeCategory(category),
      description: description || null,
      frequency,
      ...(nextDueAt ? { nextDueAt } : {}),
    });
    revalidateRecurring();
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to update recurring bill",
    };
  }
}

export async function setRecurringActive(
  _prev: RecurringActionState,
  formData: FormData,
): Promise<RecurringActionState> {
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";

  if (!id) return { error: "Missing bill id" };

  try {
    const userId = await requireUserId();
    await updateRecurringExpense(userId, id, { isActive: active });
    revalidateRecurring();
    return { success: true };
  } catch (e) {
    return {
      error:
        e instanceof Error ? e.message : "Failed to update recurring bill status",
    };
  }
}
