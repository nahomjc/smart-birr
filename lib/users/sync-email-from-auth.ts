import { sql } from "drizzle-orm";
import { requireDb } from "@/lib/db";

/** Copy emails from Supabase auth into app users where missing (for campaigns, etc.). */
export async function syncUserEmailsFromAuth(): Promise<number> {
  try {
    const db = requireDb();
    const result = await db.execute(sql`
      UPDATE public.users AS u
      SET email = au.email
      FROM auth.users AS au
      WHERE u.auth_user_id = au.id
        AND au.email IS NOT NULL
        AND length(trim(au.email)) > 0
        AND (u.email IS NULL OR length(trim(u.email)) = 0)
    `);
    return Number(result.rowCount ?? 0);
  } catch {
    return 0;
  }
}
