-- Planning vision: savings goals + manual contributions

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
