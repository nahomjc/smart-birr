-- Paste into Supabase → SQL Editor → Run
-- Adds users.role (jsonb) and notifications table

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role jsonb;

COMMENT ON COLUMN public.users.role IS 'App roles, e.g. ["user"] or {"admin": true}';

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
