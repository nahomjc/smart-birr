-- Run after initial schema: npm run db:push  OR apply this migration manually

CREATE TABLE IF NOT EXISTS "categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid REFERENCES "users"("id") ON DELETE cascade,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "sort_order" smallint DEFAULT 0 NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_user_idx" ON "categories" ("slug", "user_id");

ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "category_id" uuid;
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now() NOT NULL;
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now() NOT NULL;

ALTER TABLE "budgets" ADD COLUMN IF NOT EXISTS "year" smallint;
ALTER TABLE "budgets" ADD COLUMN IF NOT EXISTS "month" smallint;

UPDATE "budgets"
SET
  "year" = EXTRACT(YEAR FROM now())::smallint,
  "month" = EXTRACT(MONTH FROM now())::smallint
WHERE "year" IS NULL;

ALTER TABLE "budgets" ALTER COLUMN "year" SET NOT NULL;
ALTER TABLE "budgets" ALTER COLUMN "month" SET NOT NULL;

DROP INDEX IF EXISTS "budgets_user_id_unique";
CREATE UNIQUE INDEX IF NOT EXISTS "budgets_user_period_idx" ON "budgets" ("user_id", "year", "month");

CREATE TABLE IF NOT EXISTS "budget_limits" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "budget_id" uuid NOT NULL REFERENCES "budgets"("id") ON DELETE cascade,
  "category_id" uuid NOT NULL REFERENCES "categories"("id") ON DELETE cascade,
  "limit_amount" numeric(12, 2) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "budget_limits_budget_category_idx" ON "budget_limits" ("budget_id", "category_id");

CREATE TABLE IF NOT EXISTS "income_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "amount" numeric(12, 2) NOT NULL,
  "source" text NOT NULL,
  "description" text,
  "date" timestamptz DEFAULT now() NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "income_entries_user_date_idx" ON "income_entries" ("user_id", "date");

CREATE TABLE IF NOT EXISTS "recurring_expenses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "category_id" uuid NOT NULL REFERENCES "categories"("id"),
  "amount" numeric(12, 2) NOT NULL,
  "description" text,
  "frequency" text NOT NULL,
  "next_due_at" timestamptz NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "recurring_expenses_user_due_idx" ON "recurring_expenses" ("user_id", "next_due_at");
CREATE INDEX IF NOT EXISTS "expenses_user_date_idx" ON "expenses" ("user_id", "date");
CREATE INDEX IF NOT EXISTS "expenses_category_idx" ON "expenses" ("category_id");

-- Seed categories and backfill expense category_id (run after categories exist)
INSERT INTO "categories" ("slug", "name", "sort_order")
SELECT v.slug, v.name, v.ord::smallint
FROM (VALUES
  ('food', 'Food', 0),
  ('transport', 'Transport', 1),
  ('rent', 'Rent', 2),
  ('subscriptions', 'Subscriptions', 3),
  ('shopping', 'Shopping', 4),
  ('utilities', 'Utilities', 5),
  ('healthcare', 'Healthcare', 6),
  ('education', 'Education', 7),
  ('entertainment', 'Entertainment', 8),
  ('other', 'Other', 9)
) AS v(slug, name, ord)
WHERE NOT EXISTS (
  SELECT 1 FROM "categories" c WHERE c.slug = v.slug AND c.user_id IS NULL
);

-- Backfill category_id from legacy "category" text column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'category'
  ) THEN
    UPDATE "expenses" e
    SET "category_id" = c.id
    FROM "categories" c
    WHERE e."category_id" IS NULL
      AND c.user_id IS NULL
      AND lower(c.name) = lower(e.category);
  END IF;
END $$;

ALTER TABLE "expenses" ALTER COLUMN "category_id" SET NOT NULL;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_categories_id_fk"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id");
