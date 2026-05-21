import { getSessionUserId, getSupabaseUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/roles";
import { getUserById } from "@/lib/users/service";

function adminEmailsFromEnv(): string[] {
  const raw = process.env.ADMIN_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function isSessionUserAdmin(): Promise<boolean> {
  const userId = await getSessionUserId();
  if (!userId) return false;

  const appUser = await getUserById(userId);
  if (appUser && isAdminRole(appUser.role)) return true;

  const authUser = await getSupabaseUser();
  const email = authUser?.email?.trim().toLowerCase();
  if (email && adminEmailsFromEnv().includes(email)) return true;

  return false;
}
