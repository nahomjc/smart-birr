"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/require-user";
import {
  addPlanningContribution,
  createPlanningGoal,
  deletePlanningContribution,
  deletePlanningGoal,
  updatePlanningGoal,
} from "@/lib/data/planning-goals";
import type { PlanningGoalStatus } from "@/lib/db";

export type PlanningActionState = { error?: string; success?: boolean } | null;

const PLANNING_PATHS = ["/dashboard", "/dashboard/planning"] as const;

function revalidatePlanning() {
  for (const path of PLANNING_PATHS) {
    revalidatePath(path);
  }
}

function parseStatus(raw: string): PlanningGoalStatus | null {
  if (
    raw === "active" ||
    raw === "paused" ||
    raw === "completed" ||
    raw === "cancelled"
  ) {
    return raw;
  }
  return null;
}

export async function createGoal(
  _prev: PlanningActionState,
  formData: FormData,
): Promise<PlanningActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const targetAmount = Number(formData.get("targetAmount"));
  const description = String(formData.get("description") ?? "").trim();
  const targetDateRaw = String(formData.get("targetDate") ?? "").trim();

  if (!title) return { error: "Title is required" };
  if (!targetAmount || targetAmount <= 0) {
    return { error: "Enter a valid target amount" };
  }

  try {
    await requireUserId();
    await createPlanningGoal({
      title,
      targetAmount,
      description: description || null,
      targetDate: targetDateRaw ? new Date(targetDateRaw) : null,
    });
    revalidatePlanning();
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to create goal",
    };
  }
}

export async function addContribution(
  _prev: PlanningActionState,
  formData: FormData,
): Promise<PlanningActionState> {
  const goalId = String(formData.get("goalId") ?? "");
  const amount = Number(formData.get("amount"));
  const note = String(formData.get("note") ?? "").trim();

  if (!goalId) return { error: "Goal is required" };
  if (!amount || amount <= 0) {
    return { error: "Enter a valid amount" };
  }

  try {
    await requireUserId();
    await addPlanningContribution(goalId, amount, note || null);
    revalidatePlanning();
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to add contribution",
    };
  }
}

export async function updateGoalStatus(
  _prev: PlanningActionState,
  formData: FormData,
): Promise<PlanningActionState> {
  const goalId = String(formData.get("goalId") ?? "");
  const status = parseStatus(String(formData.get("status") ?? ""));

  if (!goalId || !status) return { error: "Invalid request" };

  try {
    await requireUserId();
    await updatePlanningGoal(goalId, { status });
    revalidatePlanning();
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to update goal",
    };
  }
}

export async function deleteGoal(
  _prev: PlanningActionState,
  formData: FormData,
): Promise<PlanningActionState> {
  const goalId = String(formData.get("goalId") ?? "");
  if (!goalId) return { error: "Invalid request" };

  try {
    await requireUserId();
    await deletePlanningGoal(goalId);
    revalidatePlanning();
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to delete goal",
    };
  }
}

export async function removeContribution(
  _prev: PlanningActionState,
  formData: FormData,
): Promise<PlanningActionState> {
  const contributionId = String(formData.get("contributionId") ?? "");
  if (!contributionId) return { error: "Invalid request" };

  try {
    await requireUserId();
    await deletePlanningContribution(contributionId);
    revalidatePlanning();
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to remove contribution",
    };
  }
}
