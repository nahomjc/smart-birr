-- Password reset OTP storage (run in Supabase SQL Editor or via drizzle migrate)

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
