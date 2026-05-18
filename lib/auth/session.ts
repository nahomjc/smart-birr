import { createClient } from "@/lib/supabase/server";
import { getOrCreateUserFromAuth } from "@/lib/users/service";

export async function getSupabaseUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/** App `users.id` for the logged-in Supabase user */
export async function getSessionUserId(): Promise<string | null> {
  const authUser = await getSupabaseUser();
  if (!authUser) return null;
  const appUser = await getOrCreateUserFromAuth(authUser);
  return appUser.id;
}
