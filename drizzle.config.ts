import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const appDatabaseUrl = (
  process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL
)?.trim();

if (!appDatabaseUrl) {
  throw new Error(
    "DATABASE_URL (or SUPABASE_DB_URL) is required for drizzle-kit. Add it to your .env file.",
  );
}

/**
 * drizzle-kit introspect/push/studio need a session-capable Postgres URL.
 * Supabase's transaction pooler (:6543) can hang forever on metadata queries.
 * Prefer DATABASE_MIGRATE_URL, or we rewrite pooler :6543 → session :5432.
 */
function drizzleKitDatabaseUrl(raw: string): string {
  const override = process.env.DATABASE_MIGRATE_URL?.trim();
  if (override) return override;

  if (/:6543\//.test(raw) && /\.pooler\.supabase\.com/i.test(raw)) {
    return raw.replace(":6543/", ":5432/");
  }

  return raw;
}

const databaseUrl = drizzleKitDatabaseUrl(appDatabaseUrl);

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  schemaFilter: ["public"],
  introspect: {
    casing: "preserve",
  },
});
