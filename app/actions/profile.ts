"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/require-user";
import { updateUserProfile } from "@/lib/users/service";

export type ProfileActionState = { error?: string } | null;

export async function completeOnboarding(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const incomeRaw = String(formData.get("income") ?? "").trim();
  const income = incomeRaw ? Number(incomeRaw) : undefined;

  if (!name) return { error: "Name is required" };
  if (income !== undefined && (Number.isNaN(income) || income < 0)) {
    return { error: "Income must be a positive number" };
  }

  try {
    const userId = await requireUserId();
    await updateUserProfile(userId, { name, income });
    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to save profile",
    };
  }

  redirect("/dashboard");
}
