"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { isSessionUserAdmin } from "@/lib/auth/admin";
import { appRoleToJson, type AppRole } from "@/lib/auth/roles";
import { requireUserId } from "@/lib/auth/require-user";
import { requireDb, users } from "@/lib/db";

export type UpdateRoleState = { error?: string; success?: boolean } | null;

function parseAppRole(value: string): AppRole | null {
  if (value === "user" || value === "admin") return value;
  return null;
}

export async function updateUserRole(
  _prev: UpdateRoleState,
  formData: FormData,
): Promise<UpdateRoleState> {
  if (!(await isSessionUserAdmin())) {
    return { error: "Admin access required" };
  }

  const targetUserId = String(formData.get("userId") ?? "").trim();
  const role = parseAppRole(String(formData.get("role") ?? ""));

  if (!targetUserId) return { error: "Missing user" };
  if (!role) return { error: "Invalid role" };

  const adminId = await requireUserId();
  if (role === "user" && targetUserId === adminId) {
    return { error: "You cannot remove your own admin access" };
  }

  try {
    const db = requireDb();
    const [updated] = await db
      .update(users)
      .set({ role: appRoleToJson(role) })
      .where(eq(users.id, targetUserId))
      .returning({ id: users.id });

    if (!updated) return { error: "User not found" };

    revalidatePath("/managment");
    revalidatePath(`/managment/users/${targetUserId}`);

    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to update role",
    };
  }
}
