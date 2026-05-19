-- =============================================================================
-- Smart Birr — paste this entire file into Supabase → SQL Editor → Run
-- Safe to run once on a new or existing project (uses IF NOT EXISTS / guards)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Core tables (skip any that already exist)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  auth_user_id uuid UNIQUE,
  telegram_id bigint UNIQUE,
  email text,
  name text,
  income numeric(12, 2),
  currency text DEFAULT 'ETB' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  sort_order smallint DEFAULT 0 NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_user_idx
  ON public.categories (slug, user_id);

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount numeric(12, 2) NOT NULL,
  description text,
  date timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  monthly_income numeric(12, 2) NOT NULL,
  savings_goal numeric(12, 2),
  rent_limit numeric(12, 2),
  food_limit numeric(12, 2),
  transport_limit numeric(12, 2),
  entertainment_limit numeric(12, 2),
  emergency_fund numeric(12, 2),
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- -----------------------------------------------------------------------------
-- 2. Upgrade existing expenses / budgets columns
-- -----------------------------------------------------------------------------

ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS category_id uuid;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

UPDATE public.expenses SET created_at = now() WHERE created_at IS NULL;
UPDATE public.expenses SET updated_at = now() WHERE updated_at IS NULL;

ALTER TABLE public.expenses ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.expenses ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS year smallint;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS month smallint;

UPDATE public.budgets
SET
  year = EXTRACT(YEAR FROM now())::smallint,
  month = EXTRACT(MONTH FROM now())::smallint
WHERE year IS NULL OR month IS NULL;

ALTER TABLE public.budgets ALTER COLUMN year SET NOT NULL;
ALTER TABLE public.budgets ALTER COLUMN month SET NOT NULL;

-- One budget per user per month (replaces old one-budget-per-user unique)
ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_user_id_key;
DROP INDEX IF EXISTS budgets_user_id_unique;
CREATE UNIQUE INDEX IF NOT EXISTS budgets_user_period_idx
  ON public.budgets (user_id, year, month);

-- -----------------------------------------------------------------------------
-- 3. New tables
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.budget_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  budget_id uuid NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  limit_amount numeric(12, 2) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS budget_limits_budget_category_idx
  ON public.budget_limits (budget_id, category_id);

CREATE TABLE IF NOT EXISTS public.income_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount numeric(12, 2) NOT NULL,
  source text NOT NULL,
  description text,
  date timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS income_entries_user_date_idx
  ON public.income_entries (user_id, date);

CREATE TABLE IF NOT EXISTS public.recurring_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id),
  amount numeric(12, 2) NOT NULL,
  description text,
  frequency text NOT NULL,
  next_due_at timestamptz NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS recurring_expenses_user_due_idx
  ON public.recurring_expenses (user_id, next_due_at);

CREATE INDEX IF NOT EXISTS expenses_user_date_idx
  ON public.expenses (user_id, date);

CREATE INDEX IF NOT EXISTS expenses_category_idx
  ON public.expenses (category_id);

-- -----------------------------------------------------------------------------
-- 4. Seed system categories
-- -----------------------------------------------------------------------------

INSERT INTO public.categories (slug, name, sort_order)
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
  SELECT 1 FROM public.categories c
  WHERE c.slug = v.slug AND c.user_id IS NULL
);

-- -----------------------------------------------------------------------------
-- 5. Backfill category_id (from old text "category" column if present)
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'expenses'
      AND column_name = 'category'
  ) THEN
    UPDATE public.expenses e
    SET category_id = c.id
    FROM public.categories c
    WHERE e.category_id IS NULL
      AND c.user_id IS NULL
      AND lower(c.name) = lower(e.category);
  END IF;
END $$;

-- Any expense still missing category_id → assign "Other"
UPDATE public.expenses e
SET category_id = c.id
FROM public.categories c
WHERE e.category_id IS NULL
  AND c.slug = 'other'
  AND c.user_id IS NULL;

-- -----------------------------------------------------------------------------
-- 6. Enforce category_id + drop duplicate text column
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.expenses WHERE category_id IS NULL
  ) THEN
    ALTER TABLE public.expenses ALTER COLUMN category_id SET NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  ALTER TABLE public.expenses
    ADD CONSTRAINT expenses_category_id_categories_id_fk
    FOREIGN KEY (category_id) REFERENCES public.categories(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.expenses DROP COLUMN IF EXISTS category;

-- -----------------------------------------------------------------------------
-- 7. users.role + notifications (see drizzle/0003_notifications_user_role.sql)
-- -----------------------------------------------------------------------------

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role jsonb;

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON public.notifications (user_id, read_at)
  WHERE read_at IS NULL;

-- -----------------------------------------------------------------------------
-- 8. Planning vision (goals + contributions) — see drizzle/0004_planning_goals.sql
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.planning_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_amount numeric(12, 2) NOT NULL,
  target_date timestamptz,
  status text DEFAULT 'active' NOT NULL,
  priority smallint DEFAULT 0 NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS planning_goals_user_status_idx
  ON public.planning_goals (user_id, status);

CREATE TABLE IF NOT EXISTS public.planning_goal_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  goal_id uuid NOT NULL REFERENCES public.planning_goals(id) ON DELETE CASCADE,
  amount numeric(12, 2) NOT NULL,
  note text,
  contributed_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS planning_goal_contributions_goal_date_idx
  ON public.planning_goal_contributions (goal_id, contributed_at DESC);

ALTER TABLE public.planning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_goal_contributions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 9. Expense AI confidence (see drizzle/0005_expense_ai_confidence.sql)
-- -----------------------------------------------------------------------------

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS ai_confidence numeric(4, 3);

-- -----------------------------------------------------------------------------
-- 10. Password reset OTP (see drizzle/supabase_password_reset_otps.sql)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.password_reset_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  email text NOT NULL,
  auth_user_id uuid NOT NULL,
  code_hash text NOT NULL,
  attempts smallint DEFAULT 0 NOT NULL,
  max_attempts smallint DEFAULT 5 NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS password_reset_otps_email_created_idx
  ON public.password_reset_otps (email, created_at DESC);

ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Done. Regenerate a budget in the app so budget_limits rows are created.
-- -----------------------------------------------------------------------------
