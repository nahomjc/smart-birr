import { sql } from "drizzle-orm";
import { requireDb } from "@/lib/db";

/** Copy emails from Supabase auth into app users where missing (for campaigns, etc.). */
export async function syncUserEmailsFromAuth(): Promise<void> {
  try {
    const db = requireDb();
    await db.execute(sql`
      UPDATE public.users AS u
      SET email = au.email
      FROM auth.users AS au
      WHERE u.auth_user_id = au.id
        AND au.email IS NOT NULL
        AND length(trim(au.email)) > 0
        AND (u.email IS NULL OR length(trim(u.email)) = 0)
    `);
  } catch {
    // auth.users may be unavailable on some DB roles; campaigns still use existing emails
  }
}
