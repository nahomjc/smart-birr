-- Server-only table: bot webhook uses DATABASE_URL (postgres), not client JWT.
ALTER TABLE public.telegram_sessions DISABLE ROW LEVEL SECURITY;
