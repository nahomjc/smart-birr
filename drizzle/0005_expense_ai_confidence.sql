-- AI confidence score when expense is logged via chat/Telegram (0–1)

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS ai_confidence numeric(4, 3);

COMMENT ON COLUMN public.expenses.ai_confidence IS 'AI extraction confidence 0–1 when logged via counselor';
