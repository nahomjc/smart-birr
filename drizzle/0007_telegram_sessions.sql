CREATE TABLE IF NOT EXISTS public.telegram_sessions (
  telegram_id bigint PRIMARY KEY NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  state text DEFAULT 'idle' NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS telegram_sessions_user_id_idx
  ON public.telegram_sessions (user_id);

ALTER TABLE public.telegram_sessions ENABLE ROW LEVEL SECURITY;
