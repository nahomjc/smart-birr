import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db, requireDb } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDbError(e: unknown): string {
  if (!(e instanceof Error)) return "Database query failed";
  const parts = [e.message];
  let cur: unknown = (e as Error & { cause?: unknown }).cause;
  for (let i = 0; i < 3 && cur; i++) {
    if (cur instanceof Error) {
      parts.push(cur.message);
      cur = (cur as Error & { cause?: unknown }).cause;
    } else break;
  }
  return parts.join(" → ");
}

export async function GET() {
  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  checks.env_supabase_url = {
    ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    detail: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? "NEXT_PUBLIC_SUPABASE_URL is set"
      : "Missing NEXT_PUBLIC_SUPABASE_URL",
  };

  checks.env_supabase_anon = {
    ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    detail: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
      : "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY",
  };

  const dbUrl =
    process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;
  checks.env_database_url = {
    ok: Boolean(dbUrl),
    detail: dbUrl
      ? "DATABASE_URL or SUPABASE_DB_URL is set"
      : "Missing DATABASE_URL / SUPABASE_DB_URL",
  };

  if (!db) {
    checks.database = {
      ok: false,
      detail: "Database client not initialized (no connection string)",
    };
  } else {
    try {
      await requireDb().execute(sql`SELECT 1 AS ok`);
      const users = await requireDb().execute(
        sql`SELECT COUNT(*)::int AS count FROM users`,
      );
      const count = (users[0] as { count?: number })?.count ?? 0;
      checks.database = {
        ok: true,
        detail: `Connected. users table has ${count} row(s).`,
      };
    } catch (e) {
      checks.database = {
        ok: false,
        detail: formatDbError(e),
      };
    }
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      checks.supabase_auth = { ok: false, detail: error.message };
    } else {
      checks.supabase_auth = {
        ok: true,
        detail: data.session
          ? `Session active for ${data.session.user.email}`
          : "Auth client OK (no session — sign in at /login)",
      };
    }
  } catch (e) {
    checks.supabase_auth = {
      ok: false,
      detail: e instanceof Error ? e.message : "Supabase auth check failed",
    };
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      checks,
    },
    { status: allOk ? 200 : 503 },
  );
}
